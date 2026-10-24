package veer_parivaar_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;

import veer_parivaar_backend.dto.LoginRequest;
import veer_parivaar_backend.dto.LoginResponse;
import veer_parivaar_backend.dto.RegisterRequest;
import veer_parivaar_backend.dto.RegisterResponse;
import veer_parivaar_backend.entity.User;
import veer_parivaar_backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(
            @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        return new RegisterResponse(
                user.getId(),
                user.getEmail(),
                user.getRole()
        );
    }

   
@PostMapping("/login")
public LoginResponse login(@RequestBody LoginRequest request) {
    User user = authService.login(request);
    String token = authService.generateLoginToken(user);

    return new LoginResponse(
            user.getId(),
            user.getEmail(),
            user.getRole(),
            token
    );
}

    }

