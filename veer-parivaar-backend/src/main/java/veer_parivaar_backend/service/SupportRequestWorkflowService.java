package veer_parivaar_backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import veer_parivaar_backend.dto.AssignSupportRequestRequest;
import veer_parivaar_backend.dto.StatusUpdateRequest;
import veer_parivaar_backend.entity.Assignment;
import veer_parivaar_backend.entity.SupportRequest;
import veer_parivaar_backend.entity.User;
import veer_parivaar_backend.exception.BadRequestException;
import veer_parivaar_backend.exception.ForbiddenOperationException;
import veer_parivaar_backend.exception.ResourceNotFoundException;
import veer_parivaar_backend.repository.AssignmentRepository;
import veer_parivaar_backend.repository.SupportRequestRepository;
import veer_parivaar_backend.repository.UserRepository;

@Service
public class SupportRequestWorkflowService {

    static final String STATUS_PENDING = "PENDING";
    static final String STATUS_ASSIGNED = "ASSIGNED";
    static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    static final String STATUS_RESOLVED = "RESOLVED";
    static final String STATUS_REJECTED = "REJECTED";

    private static final String ADMIN = "ADMIN";
    private static final String VOLUNTEER = "VOLUNTEER";

    private static final Set<String> ASSIGNABLE_FROM = Set.of(
            STATUS_PENDING, STATUS_ASSIGNED, STATUS_IN_PROGRESS, STATUS_REJECTED);

    private static final Map<String, Set<String>> STATUS_TRANSITIONS = Map.of(
            STATUS_PENDING, Set.of(STATUS_REJECTED),
            STATUS_ASSIGNED, Set.of(STATUS_IN_PROGRESS, STATUS_REJECTED),
            STATUS_IN_PROGRESS, Set.of(STATUS_RESOLVED, STATUS_REJECTED),
            STATUS_RESOLVED, Set.of(),
            STATUS_REJECTED, Set.of());

    private final SupportRequestRepository supportRequestRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    public SupportRequestWorkflowService(
            SupportRequestRepository supportRequestRepository,
            AssignmentRepository assignmentRepository,
            UserRepository userRepository) {
        this.supportRequestRepository = supportRequestRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
    }

    public List<SupportRequestView> listAllForAdmin() {
        requireAdmin();
        Map<Long, Assignment> assignmentsByRequestId = assignmentRepository.findAll().stream()
                .filter(assignment -> assignment.getRequest() != null)
                .collect(Collectors.toMap(
                        assignment -> assignment.getRequest().getId(),
                        assignment -> assignment,
                        (left, right) -> left));
        return supportRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(request -> new SupportRequestView(
                        request, assignmentsByRequestId.get(request.getId())))
                .toList();
    }

    @Transactional
    public SupportRequestView assign(Long requestId, AssignSupportRequestRequest request) {
        requireAdmin();
        if (request == null || request.getVolunteerId() == null) {
            throw new BadRequestException("volunteerId is required");
        }

        SupportRequest supportRequest = findRequest(requestId);
        String currentStatus = normalizeStatus(supportRequest.getStatus());
        if (!ASSIGNABLE_FROM.contains(currentStatus)) {
            throw new BadRequestException(
                    "Cannot assign a support request with status " + currentStatus);
        }

        User volunteer = userRepository.findById(request.getVolunteerId())
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found"));
        if (!VOLUNTEER.equals(normalizeRole(volunteer.getRole()))) {
            throw new BadRequestException("Assigned user must be a volunteer");
        }

        Assignment assignment = assignmentRepository.findByRequest(supportRequest)
                .orElseGet(Assignment::new);
        assignment.setRequest(supportRequest);
        assignment.setVolunteer(volunteer);
        assignment.setAssignedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        supportRequest.setStatus(STATUS_ASSIGNED);
        return new SupportRequestView(supportRequestRepository.save(supportRequest), assignment);
    }

    public List<SupportRequestView> listAssigned() {
        User actor = requireAdminOrVolunteer();
        List<Assignment> assignments = hasAuthority(ADMIN)
                ? assignmentRepository.findAllByOrderByAssignedAtDesc()
                : assignmentRepository.findByVolunteerOrderByAssignedAtDesc(actor);
        return assignments.stream()
                .map(assignment -> new SupportRequestView(assignment.getRequest(), assignment))
                .toList();
    }

    public SupportRequestView getVisible(Long requestId) {
        User actor = requireAdminOrVolunteer();
        SupportRequest supportRequest = findRequest(requestId);
        Assignment assignment = assignmentRepository.findByRequest(supportRequest).orElse(null);
        assertCanAccess(actor, assignment);
        return new SupportRequestView(supportRequest, assignment);
    }

    @Transactional
    public SupportRequestView updateStatus(Long requestId, StatusUpdateRequest request) {
        User actor = requireAdminOrVolunteer();
        if (request == null || request.getStatus() == null || request.getStatus().isBlank()) {
            throw new BadRequestException("status is required");
        }

        SupportRequest supportRequest = findRequest(requestId);
        Assignment assignment = assignmentRepository.findByRequest(supportRequest).orElse(null);
        assertCanAccess(actor, assignment);

        String currentStatus = normalizeStatus(supportRequest.getStatus());
        String nextStatus = normalizeStatus(request.getStatus());
        Set<String> allowed = STATUS_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(nextStatus)) {
            throw new BadRequestException(
                    "Cannot change status from " + currentStatus + " to " + nextStatus);
        }

        supportRequest.setStatus(nextStatus);
        return new SupportRequestView(supportRequestRepository.save(supportRequest), assignment);
    }

    private SupportRequest findRequest(Long requestId) {
        return supportRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Support request not found"));
    }

    private void assertCanAccess(User actor, Assignment assignment) {
        if (hasAuthority(ADMIN)) {
            return;
        }
        if (assignment == null
                || assignment.getVolunteer() == null
                || !Objects.equals(assignment.getVolunteer().getId(), actor.getId())) {
            throw new ForbiddenOperationException("You cannot access this support request");
        }
    }

    private User requireAdmin() {
        User user = currentUser();
        if (!hasAuthority(ADMIN)) {
            throw new ForbiddenOperationException("Only admins can perform this action");
        }
        return user;
    }

    private User requireAdminOrVolunteer() {
        User user = currentUser();
        if (!hasAuthority(ADMIN) && !hasAuthority(VOLUNTEER)) {
            throw new ForbiddenOperationException(
                    "Only admins and volunteers can access this resource");
        }
        return user;
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ForbiddenOperationException("Authenticated user is required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ForbiddenOperationException("Authenticated user is required"));
    }

    private boolean hasAuthority(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> ("ROLE_" + role).equals(authority) || role.equals(authority));
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return "";
        }
        String trimmed = role.trim();
        if (trimmed.startsWith("ROLE_")) {
            return trimmed.substring("ROLE_".length());
        }
        return trimmed;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new BadRequestException("status is required");
        }
        return status.trim().toUpperCase(Locale.ROOT);
    }

    public static final class SupportRequestView {
        private final SupportRequest request;
        private final Assignment assignment;

        public SupportRequestView(SupportRequest request, Assignment assignment) {
            this.request = request;
            this.assignment = assignment;
        }

        public SupportRequest getRequest() {
            return request;
        }

        public Optional<Assignment> getAssignment() {
            return Optional.ofNullable(assignment);
        }
    }
}
