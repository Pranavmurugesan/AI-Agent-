package com.ailead.conversion.repository;

import com.ailead.conversion.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    @Query("SELECT u FROM User u JOIN FETCH u.organization o WHERE o.id = :orgId AND LOWER(u.email) = LOWER(:email)")
    Optional<User> findByOrganizationIdAndEmail(@Param("orgId") UUID orgId, @Param("email") String email);

    @Query("SELECT u FROM User u JOIN FETCH u.organization o WHERE LOWER(o.slug) = LOWER(:slug) AND LOWER(u.email) = LOWER(:email)")
    Optional<User> findByOrganizationSlugAndEmail(@Param("slug") String slug, @Param("email") String email);

    @Query("SELECT u FROM User u JOIN FETCH u.organization o WHERE u.id = :userId")
    Optional<User> findByIdWithOrganization(@Param("userId") UUID userId);

    @Query("SELECT u FROM User u JOIN FETCH u.organization o WHERE u.id = :userId AND o.id = :orgId")
    Optional<User> findByIdAndOrganizationId(@Param("userId") UUID userId, @Param("orgId") UUID orgId);

    boolean existsByOrganizationIdAndEmail(UUID organizationId, String email);
}
