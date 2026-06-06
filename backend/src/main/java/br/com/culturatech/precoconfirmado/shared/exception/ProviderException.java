package br.com.culturatech.precoconfirmado.shared.exception;

public class ProviderException extends RuntimeException {
    private final boolean rateLimited;

    public ProviderException(String message) {
        this(message, false);
    }

    public ProviderException(String message, boolean rateLimited) {
        super(message);
        this.rateLimited = rateLimited;
    }

    public boolean isRateLimited() {
        return rateLimited;
    }
}
