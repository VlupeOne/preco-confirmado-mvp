package br.com.culturatech.precoconfirmado.provider.domain;

public interface PriceProvider {
    String providerCode();
    PriceQuote fetch(String externalId);
}
