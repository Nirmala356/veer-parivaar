package veer_parivaar_backend.dto;

import java.time.LocalDateTime;

public class StaffSupportRequestResponse {

    private Long id;
    private Long userId;
    private String email;
    private String category;
    private String description;
    private String priority;
    private String status;
    private Long volunteerId;
    private String volunteerEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public StaffSupportRequestResponse(
            Long id,
            Long userId,
            String email,
            String category,
            String description,
            String priority,
            String status,
            Long volunteerId,
            String volunteerEmail,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.category = category;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.volunteerId = volunteerId;
        this.volunteerEmail = volunteerEmail;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public String getPriority() {
        return priority;
    }

    public String getStatus() {
        return status;
    }

    public Long getVolunteerId() {
        return volunteerId;
    }

    public String getVolunteerEmail() {
        return volunteerEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
