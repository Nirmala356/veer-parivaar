package veer_parivaar_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import veer_parivaar_backend.dto.FamilyProfileRequest;
import veer_parivaar_backend.dto.FamilyProfileResponse;
import veer_parivaar_backend.entity.FamilyProfile;
import veer_parivaar_backend.service.FamilyProfileService;

@RestController
@RequestMapping("/api/family-profile")
public class FamilyProfileController {

    private final FamilyProfileService familyProfileService;

    public FamilyProfileController(FamilyProfileService familyProfileService) {
        this.familyProfileService = familyProfileService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FamilyProfileResponse create(@RequestBody FamilyProfileRequest request) {
        return toResponse(familyProfileService.create(request));
    }

    @GetMapping
    public FamilyProfileResponse getOwn() {
        return toResponse(familyProfileService.getOwn());
    }

    private FamilyProfileResponse toResponse(FamilyProfile profile) {
        return new FamilyProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getEmail(),
                profile.getPhoneNumber(),
                profile.getAddress(),
                profile.getServiceDetails());
    }
}
