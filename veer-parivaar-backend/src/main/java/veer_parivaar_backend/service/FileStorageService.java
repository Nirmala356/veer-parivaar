package veer_parivaar_backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import veer_parivaar_backend.exception.ResourceNotFoundException;
import veer_parivaar_backend.exception.StorageException;

@Service
public class FileStorageService {

    private final Path rootDirectory;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.rootDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootDirectory);
        } catch (IOException ex) {
            throw new StorageException("Failed to initialize document storage", ex);
        }
    }

    public String store(byte[] content, String extension) {
        String storedName = UUID.randomUUID() + sanitizeExtension(extension);
        Path target = resolveWithinRoot(storedName);
        try {
            Files.write(target, content, StandardOpenOption.CREATE_NEW);
        } catch (IOException ex) {
            throw new StorageException("Failed to store document", ex);
        }
        return storedName;
    }

    public Path resolveExistingFile(String storedName) {
        Path target = resolveWithinRoot(storedName);
        if (!Files.isRegularFile(target)) {
            throw new ResourceNotFoundException("Document file not found");
        }
        return target;
    }

    public void deleteQuietly(String storedName) {
        if (storedName == null || storedName.isBlank()) {
            return;
        }
        try {
            Path target = resolveWithinRoot(storedName);
            Files.deleteIfExists(target);
        } catch (RuntimeException | IOException ignored) {
            // Best-effort cleanup after a failed database save.
        }
    }

    Path getRootDirectory() {
        return rootDirectory;
    }

    private Path resolveWithinRoot(String storedName) {
        if (storedName == null || storedName.isBlank()
                || storedName.contains("/")
                || storedName.contains("\\")
                || storedName.contains("..")) {
            throw new StorageException("Invalid document storage path");
        }
        Path target = rootDirectory.resolve(storedName).normalize();
        if (!target.startsWith(rootDirectory)) {
            throw new StorageException("Invalid document storage path");
        }
        return target;
    }

    private String sanitizeExtension(String extension) {
        if (extension == null || !extension.startsWith(".") || extension.contains("/")
                || extension.contains("\\") || extension.contains("..")) {
            throw new StorageException("Invalid document storage path");
        }
        return extension;
    }
}
