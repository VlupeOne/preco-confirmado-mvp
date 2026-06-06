package br.com.culturatech.precoconfirmado.verification.domain;

public enum VerificationStatus {
    PENDING_RECHECK,
    APPROVED,
    REJECTED,
    EXPIRED,
    PROVIDER_ERROR
}
