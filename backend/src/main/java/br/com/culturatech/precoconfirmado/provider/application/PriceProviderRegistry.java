package br.com.culturatech.precoconfirmado.provider.application;

import br.com.culturatech.precoconfirmado.provider.domain.PriceProvider;
import br.com.culturatech.precoconfirmado.shared.exception.ProviderException;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class PriceProviderRegistry {
    private final Map<String, PriceProvider> providers;

    public PriceProviderRegistry(java.util.List<PriceProvider> providers) {
        this.providers = providers.stream().collect(Collectors.toUnmodifiableMap(
                provider -> provider.providerCode().toUpperCase(Locale.ROOT), Function.identity()));
    }

    public PriceProvider require(String providerCode) {
        PriceProvider provider = providers.get(providerCode.toUpperCase(Locale.ROOT));
        if (provider == null) {
            throw new ProviderException("Provider is disabled or unsupported: " + providerCode);
        }
        return provider;
    }
}
