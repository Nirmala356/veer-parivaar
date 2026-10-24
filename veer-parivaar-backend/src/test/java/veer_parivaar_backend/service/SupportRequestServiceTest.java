package veer_parivaar_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import veer_parivaar_backend.dto.SupportRequestRequest;
import veer_parivaar_backend.entity.SupportRequest;
import veer_parivaar_backend.entity.User;
import veer_parivaar_backend.exception.BadRequestException;
import veer_parivaar_backend.exception.ForbiddenOperationException;
import veer_parivaar_backend.exception.ResourceNotFoundException;
import veer_parivaar_backend.repository.SupportRequestRepository;
import veer_parivaar_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SupportRequestServiceTest {

    @Mock
    private SupportRequestRepository supportRequestRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SupportRequestService supportRequestService;

    private User owner;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(11L);
        owner.setEmail("family@example.com");
        owner.setRole("FAMILY_MEMBER");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "family@example.com",
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_FAMILY_MEMBER"))));
        when(userRepository.findByEmail("family@example.com")).thenReturn(Optional.of(owner));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createUsesAuthenticatedUserAndSetsPendingStatus() {
        SupportRequestRequest request = new SupportRequestRequest();
        request.setCategory("Medical");
        request.setDescription("Need help with hospital paperwork");
        request.setPriority("HIGH");
        when(supportRequestRepository.save(any(SupportRequest.class))).thenAnswer(invocation -> {
            SupportRequest saved = invocation.getArgument(0);
            saved.setId(5L);
            return saved;
        });

        SupportRequest result = supportRequestService.create(request);

        ArgumentCaptor<SupportRequest> captor = ArgumentCaptor.forClass(SupportRequest.class);
        verify(supportRequestRepository).save(captor.capture());
        SupportRequest stored = captor.getValue();
        assertEquals(owner, stored.getUser());
        assertEquals("Medical", stored.getCategory());
        assertEquals("Need help with hospital paperwork", stored.getDescription());
        assertEquals("HIGH", stored.getPriority());
        assertEquals("PENDING", stored.getStatus());
        assertEquals(5L, result.getId());
    }

    @Test
    void createRejectsBlankCategory() {
        SupportRequestRequest request = new SupportRequestRequest();
        request.setCategory("  ");
        request.setDescription("Need help");
        request.setPriority("LOW");

        assertThrows(BadRequestException.class, () -> supportRequestService.create(request));
        verify(supportRequestRepository, never()).save(any());
    }

    @Test
    void listOwnReturnsOnlyCurrentUserRequests() {
        SupportRequest own = new SupportRequest();
        own.setId(1L);
        own.setUser(owner);
        when(supportRequestRepository.findByUserOrderByCreatedAtDesc(owner))
                .thenReturn(List.of(own));

        List<SupportRequest> result = supportRequestService.listOwn();

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
        verify(supportRequestRepository).findByUserOrderByCreatedAtDesc(owner);
    }

    @Test
    void getOwnRejectsRequestsOwnedByAnotherUser() {
        User other = new User();
        other.setId(99L);
        SupportRequest supportRequest = new SupportRequest();
        supportRequest.setId(3L);
        supportRequest.setUser(other);
        when(supportRequestRepository.findById(3L)).thenReturn(Optional.of(supportRequest));

        assertThrows(ForbiddenOperationException.class, () -> supportRequestService.getOwn(3L));
    }

    @Test
    void getOwnReturnsNotFoundWhenMissing() {
        when(supportRequestRepository.findById(8L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> supportRequestService.getOwn(8L));
    }
}
