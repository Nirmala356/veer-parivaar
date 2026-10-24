package veer_parivaar_backend.service;

public enum DetectedFileType {
    PDF("PDF", "application/pdf", ".pdf"),
    JPEG("JPEG", "image/jpeg", ".jpg"),
    PNG("PNG", "image/png", ".png");

    private final String documentType;
    private final String mediaType;
    private final String extension;

    DetectedFileType(String documentType, String mediaType, String extension) {
        this.documentType = documentType;
        this.mediaType = mediaType;
        this.extension = extension;
    }

    public String getDocumentType() {
        return documentType;
    }

    public String getMediaType() {
        return mediaType;
    }

    public String getExtension() {
        return extension;
    }
}
