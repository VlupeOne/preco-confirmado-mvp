package br.com.culturatech.precoconfirmado.auth.api;

import br.com.culturatech.precoconfirmado.auth.application.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastrar usuário e emitir tokens")
    AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest servletRequest) {
        return authService.register(request, servletRequest.getHeader("User-Agent"), servletRequest.getRemoteAddr());
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar com e-mail e senha")
    AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        return authService.login(request, servletRequest.getHeader("User-Agent"), servletRequest.getRemoteAddr());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotacionar refresh token")
    AuthResponse refresh(@Valid @RequestBody RefreshRequest request, HttpServletRequest servletRequest) {
        return authService.refresh(request.refreshToken(), servletRequest.getHeader("User-Agent"),
                servletRequest.getRemoteAddr());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Revogar refresh token")
    void logout(@Valid @RequestBody RefreshRequest request, @AuthenticationPrincipal Jwt jwt) {
        authService.logout(request.refreshToken(), UUID.fromString(jwt.getSubject()));
    }
}
