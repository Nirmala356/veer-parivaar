package veer_parivaar_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import veer_parivaar_backend.dto.SupportRequestRequest;
import veer_parivaar_backend.dto.SupportRequestResponse;
import veer_parivaar_backend.entity.SupportRequest;
import veer_parivaar_backend.service.SupportRequestService;

@RestController
@RequestMapping("/api/support-requests")
public class SupportRequestController {

    private final SupportRequestService supportRequestService;

    public SupportRequestController(SupportRequestService supportRequestService) {
        this.supportRequestService = supportRequestService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SupportRequestResponse create(@RequestBody SupportRequestRequest request) {
        return toResponse(supportRequestService.create(request));
    }

    @GetMapping
    public List<SupportRequestResponse> listOwn() {
        return supportRequestService.listOwn().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public SupportRequestResponse getOwn(@PathVariable Long id) {
        return toResponse(supportRequestService.getOwn(id));
    }

    private SupportRequestResponse toResponse(SupportRequest supportRequest) {
        return new SupportRequestResponse(
                supportRequest.getId(),
                supportRequest.getUser().getId(),
                supportRequest.getUser().getEmail(),
                supportRequest.getCategory(),
                supportRequest.getDescription(),
                supportRequest.getPriority(),
                supportRequest.getStatus(),
                supportRequest.getCreatedAt(),
                supportRequest.getUpdatedAt());
    }
}
