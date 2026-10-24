package veer_parivaar_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import veer_parivaar_backend.dto.AssignSupportRequestRequest;
import veer_parivaar_backend.dto.StaffSupportRequestResponse;
import veer_parivaar_backend.entity.Assignment;
import veer_parivaar_backend.entity.SupportRequest;
import veer_parivaar_backend.entity.User;
import veer_parivaar_backend.service.SupportRequestWorkflowService;
import veer_parivaar_backend.service.SupportRequestWorkflowService.SupportRequestView;

@RestController
@RequestMapping("/api/admin/support-requests")
public class AdminSupportRequestController {

    private final SupportRequestWorkflowService workflowService;

    public AdminSupportRequestController(SupportRequestWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    public List<StaffSupportRequestResponse> listAll() {
        return workflowService.listAllForAdmin().stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping("/{id}/assign")
    public StaffSupportRequestResponse assign(
            @PathVariable Long id,
            @RequestBody AssignSupportRequestRequest request) {
        return toResponse(workflowService.assign(id, request));
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
