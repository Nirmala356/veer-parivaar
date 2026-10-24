package veer_parivaar_backend.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import veer_parivaar_backend.dto.FamilyProfileRequest;
import veer_parivaar_backend.entity.FamilyProfile;
import veer_parivaar_backend.entity.User;
import veer_parivaar_backend.exception.BadRequestException;
import veer_parivaar_backend.exception.ForbiddenOperationException;
import veer_parivaar_backend.exception.ResourceNotFoundException;
import veer_parivaar_backend.repository.FamilyProfileRepository;
import veer_parivaar_backend.repository.UserRepository;

@Service
public class FamilyProfileService {

    private static final String FAMILY_MEMBER_ROLE = "FAMILY_MEMBER";

    private final FamilyProfileRepository familyProfileRepository;
    private final UserRepository userRepository;

    public FamilyProfileService(
            FamilyProfileRepository familyProfileRepository,
            UserRepository userRepository) {
        this.familyProfileRepository = familyProfileRepository;
        this.userRepository = userRepository;
    }

    public FamilyProfile create(FamilyProfileRequest request) {
        User owner = currentFamilyMember();
        if (familyProfileRepository.existsByUser(owner)) {
            throw new IllegalArgumentException("Family profile already exists");
        }

        String phoneNumber = requiredText(request.getPhoneNumber(), "phoneNumber", 15);
        String address = requiredText(request.getAddress(), "address", 255);
        String serviceDetails = optionalText(request.getServiceDetails());

        FamilyProfile profile = new FamilyProfile();
        profile.setUser(owner);
        profile.setPhoneNumber(phoneNumber);
        profile.setAddress(address);
        profile.setServiceDetails(serviceDetails);
        return familyProfileRepository.save(profile);
    }

    public FamilyProfile getOwn() {
        User owner = currentFamilyMember();
        return familyProfileRepository.findByUser(owner)
                .orElseThrow(() -> new ResourceNotFoundException("Family profile not found"));
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
                    "Only family members can create or view a family profile");
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

    private String optionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
