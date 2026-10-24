package veer_parivaar_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import veer_parivaar_backend.entity.Assignment;
import veer_parivaar_backend.entity.SupportRequest;
import veer_parivaar_backend.entity.User;

public interface AssignmentRepository
        extends JpaRepository<Assignment, Long> {

    Optional<Assignment> findByRequest(SupportRequest request);

    Optional<Assignment> findByRequest_Id(Long requestId);

    List<Assignment> findByVolunteerOrderByAssignedAtDesc(User volunteer);

    List<Assignment> findAllByOrderByAssignedAtDesc();
}
