package veer_parivaar_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import veer_parivaar_backend.entity.Document;
import veer_parivaar_backend.entity.User;
import veer_parivaar_backend.exception.BadRequestException;
import veer_parivaar_backend.exception.ForbiddenOperationException;
import veer_parivaar_backend.repository.DocumentRepository;
import veer_parivaar_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private DocumentService documentService;

    private User owner;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(11L);
        owner.setEmail("family@example.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "family@example.com",
                        null,
                        List.of()));
        when(userRepository.findByEmail("family@example.com")).thenReturn(Optional.of(owner));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void uploadStoresMetadataForAuthenticatedUserAndIgnoresClientUserId() {
        byte[] png = new byte[] {
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x01
        };
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "../../other-user/idcard.exe",
                "application/octet-stream",
                png);
        when(fileStorageService.store(eq(png), eq(".png"))).thenReturn("stored.png");
        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> {
            Document saved = invocation.getArgument(0);
            saved.setId(5L);
            return saved;
        });

        Document result = documentService.upload(file);

        ArgumentCaptor<Document> captor = ArgumentCaptor.forClass(Document.class);
        verify(documentRepository).save(captor.capture());
        Document stored = captor.getValue();
        assertEquals(owner, stored.getUser());
        assertEquals("PNG", stored.getDocumentType());
        assertEquals("idcard.exe", stored.getDocumentName());
        assertEquals("stored.png", stored.getDocumentUrl());
        assertEquals("UPLOADED", stored.getStatus());
        assertEquals(5L, result.getId());
    }

    @Test
    void uploadRejectsEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]);

        assertThrows(BadRequestException.class, () -> documentService.upload(file));
        verify(fileStorageService, never()).store(any(), any());
    }

    @Test
    void downloadRejectsDocumentsOwnedByAnotherUser() {
        User other = new User();
        other.setId(99L);
        Document document = new Document();
        document.setId(3L);
        document.setUser(other);
        when(documentRepository.findById(3L)).thenReturn(Optional.of(document));

        assertThrows(ForbiddenOperationException.class, () -> documentService.downloadOwn(3L));
        verify(fileStorageService, never()).resolveExistingFile(any());
    }
}
