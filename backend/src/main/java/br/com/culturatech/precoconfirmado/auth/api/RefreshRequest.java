package br.com.culturatech.precoconfirmado.auth.api;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(@NotBlank String refreshToken) {
}
