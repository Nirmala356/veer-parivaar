package veer_parivaar_backend.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import veer_parivaar_backend.exception.StorageException;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void storesFileUnderConfiguredDirectoryWithGeneratedName() throws Exception {
        FileStorageService storage = new FileStorageService(tempDir.toString());
        byte[] content = new byte[] {0x25, 0x50, 0x44, 0x46};

        String storedName = storage.store(content, ".pdf");
        Path stored = storage.resolveExistingFile(storedName);

        assertTrue(stored.startsWith(tempDir.toAbsolutePath().normalize()));
        assertFalse(storedName.contains(".."));
        assertTrue(Files.isRegularFile(stored));
    }

    @Test
    void rejectsPathTraversalInStoredName() {
        FileStorageService storage = new FileStorageService(tempDir.toString());

        assertThrows(StorageException.class,
                () -> storage.resolveExistingFile("../secret.txt"));
        assertThrows(StorageException.class,
                () -> storage.resolveExistingFile("..\\secret.txt"));
        assertThrows(StorageException.class,
                () -> storage.resolveExistingFile("dir/file.pdf"));
    }
}
