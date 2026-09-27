package com.menurestaurante.service;

import com.menurestaurante.dto.LoginRequest;
import com.menurestaurante.dto.LoginResponse;
import com.menurestaurante.model.AppUser;
import com.menurestaurante.repository.AppUserRepository;
import com.menurestaurante.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AppUserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        AppUser user = userRepository.findByUsername(request.username())
                .filter(found -> passwordEncoder.matches(request.password(), found.getPasswordHash()))
                .orElseThrow(() -> new BadCredentialsException("Credenciales incorrectas"));
        JwtService.IssuedToken token = jwtService.issue(user);
        return new LoginResponse(token.value(), user.getUsername(), token.expiresAt());
    }
}
