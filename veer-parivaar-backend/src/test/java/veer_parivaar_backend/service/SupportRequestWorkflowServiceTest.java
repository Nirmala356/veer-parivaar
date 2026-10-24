package veer_parivaar_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import veer_parivaar_backend.dto.AssignSupportRequestRequest;
import veer_parivaar_backend.dto.StatusUpdateRequest;
import veer_parivaar_backend.entity.Assignment;
import veer_parivaar_backend.entity.SupportRequest;
import veer_parivaar_backend.entity.User;
import veer_parivaar_backend.exception.BadRequestException;
import veer_parivaar_backend.exception.ForbiddenOperationException;
import veer_parivaar_backend.repository.AssignmentRepository;
import veer_parivaar_backend.repository.SupportRequestRepository;
import veer_parivaar_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SupportRequestWorkflowServiceTest {

    @Mock
    private SupportRequestRepository supportRequestRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SupportRequestWorkflowService workflowService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void assignCreatesAssignmentAndSetsAssignedStatus() {
        User admin = authenticate("admin@example.com", 1L, "ADMIN");
        User volunteer = user(20L, "volunteer@example.com", "VOLUNTEER");
        User family = user(11L, "family@example.com", "FAMILY_MEMBER");
        SupportRequest supportRequest = pendingRequest(5L, family);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(supportRequestRepository.findById(5L)).thenReturn(Optional.of(supportRequest));
        when(userRepository.findById(20L)).thenReturn(Optional.of(volunteer));
        when(assignmentRepository.findByRequest(supportRequest)).thenReturn(Optional.empty());
        when(assignmentRepository.save(any(Assignment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(supportRequestRepository.save(any(SupportRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AssignSupportRequestRequest request = new AssignSupportRequestRequest();
        request.setVolunteerId(20L);

        SupportRequestWorkflowService.SupportRequestView result = workflowService.assign(5L, request);

        ArgumentCaptor<Assignment> assignmentCaptor = ArgumentCaptor.forClass(Assignment.class);
        verify(assignmentRepository).save(assignmentCaptor.capture());
        assertEquals(supportRequest, assignmentCaptor.getValue().getRequest());
        assertEquals(volunteer, assignmentCaptor.getValue().getVolunteer());
        assertEquals("ASSIGNED", result.getRequest().getStatus());
        assertEquals(volunteer, result.getAssignment().orElseThrow().getVolunteer());
    }

    @Test
    void volunteerCannotAssignRequests() {
        User volunteer = authenticate("volunteer@example.com", 20L, "VOLUNTEER");
        when(userRepository.findByEmail("volunteer@example.com")).thenReturn(Optional.of(volunteer));

        AssignSupportRequestRequest request = new AssignSupportRequestRequest();
        request.setVolunteerId(20L);

        assertThrows(ForbiddenOperationException.class, () -> workflowService.assign(5L, request));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void familyMemberCannotListAssignedRequests() {
        User family = authenticate("family@example.com", 11L, "FAMILY_MEMBER");
        when(userRepository.findByEmail("family@example.com")).thenReturn(Optional.of(family));

        assertThrows(ForbiddenOperationException.class, () -> workflowService.listAssigned());
        verify(assignmentRepository, never()).findByVolunteerOrderByAssignedAtDesc(any());
    }

    @Test
    void volunteerCannotViewRequestAssignedToSomeoneElse() {
        User volunteer = authenticate("volunteer@example.com", 20L, "VOLUNTEER");
        User other = user(21L, "other@example.com", "VOLUNTEER");
        SupportRequest supportRequest = pendingRequest(5L, user(11L, "family@example.com", "FAMILY_MEMBER"));
        supportRequest.setStatus("ASSIGNED");
        Assignment assignment = new Assignment();
        assignment.setRequest(supportRequest);
        assignment.setVolunteer(other);

        when(userRepository.findByEmail("volunteer@example.com")).thenReturn(Optional.of(volunteer));
        when(supportRequestRepository.findById(5L)).thenReturn(Optional.of(supportRequest));
        when(assignmentRepository.findByRequest(supportRequest)).thenReturn(Optional.of(assignment));

        assertThrows(ForbiddenOperationException.class, () -> workflowService.getVisible(5L));
    }

    @Test
    void volunteerCanMoveAssignedRequestToInProgress() {
        User volunteer = authenticate("volunteer@example.com", 20L, "VOLUNTEER");
        SupportRequest supportRequest = pendingRequest(5L, user(11L, "family@example.com", "FAMILY_MEMBER"));
        supportRequest.setStatus("ASSIGNED");
        Assignment assignment = new Assignment();
        assignment.setRequest(supportRequest);
        assignment.setVolunteer(volunteer);

        when(userRepository.findByEmail("volunteer@example.com")).thenReturn(Optional.of(volunteer));
        when(supportRequestRepository.findById(5L)).thenReturn(Optional.of(supportRequest));
        when(assignmentRepository.findByRequest(supportRequest)).thenReturn(Optional.of(assignment));
        when(supportRequestRepository.save(any(SupportRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setStatus("IN_PROGRESS");

        SupportRequestWorkflowService.SupportRequestView result =
                workflowService.updateStatus(5L, request);

        assertEquals("IN_PROGRESS", result.getRequest().getStatus());
    }

    @Test
    void volunteerCannotSkipToResolvedFromAssigned() {
        User volunteer = authenticate("volunteer@example.com", 20L, "VOLUNTEER");
        SupportRequest supportRequest = pendingRequest(5L, user(11L, "family@example.com", "FAMILY_MEMBER"));
        supportRequest.setStatus("ASSIGNED");
        Assignment assignment = new Assignment();
        assignment.setRequest(supportRequest);
        assignment.setVolunteer(volunteer);

        when(userRepository.findByEmail("volunteer@example.com")).thenReturn(Optional.of(volunteer));
        when(supportRequestRepository.findById(5L)).thenReturn(Optional.of(supportRequest));
        when(assignmentRepository.findByRequest(supportRequest)).thenReturn(Optional.of(assignment));

        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setStatus("RESOLVED");

        assertThrows(BadRequestException.class, () -> workflowService.updateStatus(5L, request));
        verify(supportRequestRepository, never()).save(any());
    }

    private User authenticate(String email, Long id, String role) {
        User user = user(id, email, role);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
        return user;
    }

    private User user(Long id, String email, String role) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setRole(role);
        return user;
    }

    private SupportRequest pendingRequest(Long id, User owner) {
        SupportRequest supportRequest = new SupportRequest();
        supportRequest.setId(id);
        supportRequest.setUser(owner);
        supportRequest.setCategory("Medical");
        supportRequest.setDescription("Need help");
        supportRequest.setPriority("HIGH");
        supportRequest.setStatus("PENDING");
        return supportRequest;
    }
}
