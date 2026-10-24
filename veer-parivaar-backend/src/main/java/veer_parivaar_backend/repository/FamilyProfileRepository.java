package veer_parivaar_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import veer_parivaar_backend.entity.FamilyProfile;
import veer_parivaar_backend.entity.User;

public interface FamilyProfileRepository extends JpaRepository<FamilyProfile, Long> {

    boolean existsByUser(User user);

    Optional<FamilyProfile> findByUser(User user);
}
