package veer_parivaar_backend.controller;

import java.net.MalformedURLException;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import veer_parivaar_backend.dto.DocumentResponse;
import veer_parivaar_backend.entity.Document;
import veer_parivaar_backend.exception.StorageException;
import veer_parivaar_backend.service.DocumentService;
import veer_parivaar_backend.service.DocumentService.DocumentFile;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse upload(@RequestParam("file") MultipartFile file) {
        return toResponse(documentService.upload(file));
    }

    @GetMapping
    public List<DocumentResponse> listOwn() {
        return documentService.listOwn().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        DocumentFile documentFile = documentService.downloadOwn(id);
        try {
            Resource resource = new UrlResource(documentFile.getPath().toUri());
            ContentDisposition disposition = ContentDisposition.attachment()
                    .filename(documentFile.getDocument().getDocumentName())
                    .build();
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            documentFile.getFileType().getMediaType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                    .body(resource);
        } catch (MalformedURLException ex) {
            throw new StorageException("Failed to store document", ex);
        }
    }

    private DocumentResponse toResponse(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getDocumentName(),
                document.getDocumentType(),
                document.getStatus(),
                document.getCreatedAt());
    }
}
