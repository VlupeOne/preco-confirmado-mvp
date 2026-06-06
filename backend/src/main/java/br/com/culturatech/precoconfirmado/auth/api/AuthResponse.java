package br.com.culturatech.precoconfirmado.auth.api;

public record AuthResponse(String accessToken, String refreshToken, long expiresIn, String tokenType) {
}
