package veer_parivaar_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import veer_parivaar_backend.entity.Resource;

public interface ResourceRepository
        extends JpaRepository<Resource, Long> {
}