package veer_parivaar_backend.service;

import java.util.List;
import java.util.Objects;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import veer_parivaar_backend.dto.SupportRequestRequest;
import veer_parivaar_backend.entity.SupportRequest;
import veer_parivaar_backend.entity.User;
import veer_parivaar_backend.exception.BadRequestException;
import veer_parivaar_backend.exception.ForbiddenOperationException;
import veer_parivaar_backend.exception.ResourceNotFoundException;
import veer_parivaar_backend.repository.SupportRequestRepository;
import veer_parivaar_backend.repository.UserRepository;

@Service
public class SupportRequestService {

    static final String STATUS_PENDING = "PENDING";
    private static final String FAMILY_MEMBER_ROLE = "FAMILY_MEMBER";

    private final SupportRequestRepository supportRequestRepository;
    private final UserRepository userRepository;

    public SupportRequestService(
            SupportRequestRepository supportRequestRepository,
            UserRepository userRepository) {
        this.supportRequestRepository = supportRequestRepository;
        this.userRepository = userRepository;
    }

    public SupportRequest create(SupportRequestRequest request) {
        User owner = currentFamilyMember();
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        SupportRequest supportRequest = new SupportRequest();
        supportRequest.setUser(owner);
        supportRequest.setCategory(requiredText(request.getCategory(), "category", 100));
        supportRequest.setDescription(requiredText(request.getDescription(), "description", 4000));
        supportRequest.setPriority(requiredText(request.getPriority(), "priority", 30));
        supportRequest.setStatus(STATUS_PENDING);
        return supportRequestRepository.save(supportRequest);
    }

    public List<SupportRequest> listOwn() {
        return supportRequestRepository.findByUserOrderByCreatedAtDesc(currentFamilyMember());
    }

    public SupportRequest getOwn(Long id) {
        User owner = currentFamilyMember();
        SupportRequest supportRequest = supportRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support request not found"));
        if (!Objects.equals(supportRequest.getUser().getId(), owner.getId())) {
            throw new ForbiddenOperationException("You cannot access this support request");
        }
        return supportRequest;
    }

    private User currentFamilyMember() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ForbiddenOperationException("Authenticated user is required");
        }

        boolean familyMember = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> "ROLE_FAMILY_MEMBER".equals(authority)
                        || FAMILY_MEMBER_ROLE.equals(authority));
        if (!familyMember) {
            throw new ForbiddenOperationException(
                    "Only family members can create or view support requests");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ForbiddenOperationException("Authenticated user is required"));
    }

    private String requiredText(String value, String field, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(field + " is required");
        }
        String trimmed = value.trim();
        if (trimmed.length() > maxLength) {
            throw new BadRequestException(field + " must be at most " + maxLength + " characters");
        }
        return trimmed;
    }
}
