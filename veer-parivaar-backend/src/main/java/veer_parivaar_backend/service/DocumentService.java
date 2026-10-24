package veer_parivaar_backend.service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Objects;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import veer_parivaar_backend.entity.Document;
import veer_parivaar_backend.entity.User;
import veer_parivaar_backend.exception.BadRequestException;
import veer_parivaar_backend.exception.ForbiddenOperationException;
import veer_parivaar_backend.exception.ResourceNotFoundException;
import veer_parivaar_backend.exception.StorageException;
import veer_parivaar_backend.repository.DocumentRepository;
import veer_parivaar_backend.repository.UserRepository;

@Service
public class DocumentService {

    static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;
    static final String STATUS_UPLOADED = "UPLOADED";

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public DocumentService(
            DocumentRepository documentRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    public Document upload(MultipartFile file) {
        User owner = currentUser();
        byte[] content = readFileBytes(file);
        DetectedFileType fileType = FileTypeDetector.detect(content)
                .orElseThrow(() -> new BadRequestException(
                        "Only PDF, JPG/JPEG, and PNG files are allowed"));

        String storedName = fileStorageService.store(content, fileType.getExtension());
        try {
            Document document = new Document();
            document.setUser(owner);
            document.setDocumentType(fileType.getDocumentType());
            document.setDocumentName(safeOriginalName(file.getOriginalFilename(), fileType));
            document.setDocumentUrl(storedName);
            document.setStatus(STATUS_UPLOADED);
            document.setRejectionReason(null);
            return documentRepository.save(document);
        } catch (RuntimeException ex) {
            fileStorageService.deleteQuietly(storedName);
            throw ex;
        }
    }

    public List<Document> listOwn() {
        return documentRepository.findByUserOrderByCreatedAtDesc(currentUser());
    }

    public DocumentFile downloadOwn(Long documentId) {
        User owner = currentUser();
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        if (!Objects.equals(document.getUser().getId(), owner.getId())) {
            throw new ForbiddenOperationException("You cannot access this document");
        }

        Path path = fileStorageService.resolveExistingFile(document.getDocumentUrl());
        DetectedFileType fileType = DetectedFileType.valueOf(document.getDocumentType());
        return new DocumentFile(document, path, fileType);
    }

    private byte[] readFileBytes(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("file is required");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File must be 5 MB or smaller");
        }
        try {
            byte[] content = file.getBytes();
            if (content.length == 0) {
                throw new BadRequestException("file is required");
            }
            if (content.length > MAX_FILE_SIZE_BYTES) {
                throw new BadRequestException("File must be 5 MB or smaller");
            }
            return content;
        } catch (IOException ex) {
            throw new StorageException("Failed to store document", ex);
        }
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ForbiddenOperationException("Authenticated user is required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ForbiddenOperationException("Authenticated user is required"));
    }

    private String safeOriginalName(String originalFilename, DetectedFileType fileType) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "document" + fileType.getExtension();
        }
        String name = originalFilename.replace("\\", "/");
        int slash = name.lastIndexOf('/');
        if (slash >= 0) {
            name = name.substring(slash + 1);
        }
        name = name.replaceAll("[\\p{Cntrl}]", "").trim();
        if (name.isBlank() || name.contains("..") || name.length() > 255) {
            return "document" + fileType.getExtension();
        }
        return name;
    }

    public static final class DocumentFile {
        private final Document document;
        private final Path path;
        private final DetectedFileType fileType;

        public DocumentFile(Document document, Path path, DetectedFileType fileType) {
            this.document = document;
            this.path = path;
            this.fileType = fileType;
        }

        public Document getDocument() {
            return document;
        }

        public Path getPath() {
            return path;
        }

        public DetectedFileType getFileType() {
            return fileType;
        }
    }
}
