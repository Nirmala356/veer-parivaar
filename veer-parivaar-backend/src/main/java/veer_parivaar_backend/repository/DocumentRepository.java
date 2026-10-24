package veer_parivaar_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import veer_parivaar_backend.entity.Document;
import veer_parivaar_backend.entity.User;

public interface DocumentRepository
        extends JpaRepository<Document, Long> {

    List<Document> findByUserOrderByCreatedAtDesc(User user);
}