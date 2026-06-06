package br.com.culturatech.precoconfirmado.user.api;

import br.com.culturatech.precoconfirmado.shared.exception.NotFoundException;
import br.com.culturatech.precoconfirmado.user.infrastructure.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    @Operation(summary = "Obter usuário autenticado")
    UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return userRepository.findById(UUID.fromString(jwt.getSubject()))
                .map(UserResponse::from)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    }
}
