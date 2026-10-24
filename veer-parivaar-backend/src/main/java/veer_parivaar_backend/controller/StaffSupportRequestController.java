package veer_parivaar_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import veer_parivaar_backend.dto.StaffSupportRequestResponse;
import veer_parivaar_backend.dto.StatusUpdateRequest;
import veer_parivaar_backend.entity.Assignment;
import veer_parivaar_backend.entity.SupportRequest;
import veer_parivaar_backend.entity.User;
import veer_parivaar_backend.service.SupportRequestWorkflowService;
import veer_parivaar_backend.service.SupportRequestWorkflowService.SupportRequestView;

@RestController
@RequestMapping("/api/staff/support-requests")
public class StaffSupportRequestController {

    private final SupportRequestWorkflowService workflowService;

    public StaffSupportRequestController(SupportRequestWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    public List<StaffSupportRequestResponse> listAssigned() {
        return workflowService.listAssigned().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public StaffSupportRequestResponse getVisible(@PathVariable Long id) {
        return toResponse(workflowService.getVisible(id));
    }

    @PatchMapping("/{id}/status")
    public StaffSupportRequestResponse updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        return toResponse(workflowService.updateStatus(id, request));
    }

    private StaffSupportRequestResponse toResponse(SupportRequestView view) {
        SupportRequest supportRequest = view.getRequest();
        User volunteer = view.getAssignment()
                .map(Assignment::getVolunteer)
                .orElse(null);
        return new StaffSupportRequestResponse(
                supportRequest.getId(),
                supportRequest.getUser().getId(),
                supportRequest.getUser().getEmail(),
                supportRequest.getCategory(),
                supportRequest.getDescription(),
                supportRequest.getPriority(),
                supportRequest.getStatus(),
                volunteer != null ? volunteer.getId() : null,
                volunteer != null ? volunteer.getEmail() : null,
                supportRequest.getCreatedAt(),
                supportRequest.getUpdatedAt());
    }
}
