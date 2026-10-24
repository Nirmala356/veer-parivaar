package veer_parivaar_backend.dto;

import java.time.LocalDateTime;

public class DocumentResponse {

    private Long id;
    private String documentName;
    private String documentType;
    private String status;
    private LocalDateTime createdAt;

    public DocumentResponse(
            Long id,
            String documentName,
            String documentType,
            String status,
            LocalDateTime createdAt) {
        this.id = id;
        this.documentName = documentName;
        this.documentType = documentType;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getDocumentName() {
        return documentName;
    }

    public String getDocumentType() {
        return documentType;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
