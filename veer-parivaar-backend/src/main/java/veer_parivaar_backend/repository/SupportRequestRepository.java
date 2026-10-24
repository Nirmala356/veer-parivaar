package veer_parivaar_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import veer_parivaar_backend.entity.SupportRequest;
import veer_parivaar_backend.entity.User;

public interface SupportRequestRepository
        extends JpaRepository<SupportRequest, Long> {

    List<SupportRequest> findByUserOrderByCreatedAtDesc(User user);

    List<SupportRequest> findAllByOrderByCreatedAtDesc();
}