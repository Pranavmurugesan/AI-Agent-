package com.ailead.conversion.service;

import com.ailead.conversion.dto.UserResponse;
import com.ailead.conversion.entity.User;
import com.ailead.conversion.repository.UserRepository;
import com.ailead.conversion.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        User user = userRepository.findByIdAndOrganizationId(principal.getId(), principal.getOrganizationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User context not found"));

        return UserResponse.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public java.util.List<UserResponse> getOrganizationUsers(UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        return userRepository.findByOrganizationIdAndActiveTrue(principal.getOrganizationId())
                .stream()
                .map(UserResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }
}
