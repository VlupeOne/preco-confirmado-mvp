package br.com.culturatech.precoconfirmado.verification.domain;

import java.util.List;

public record ConfidenceScoreResult(int score, Confidence confidence, List<String> reasons) {
    public boolean approved() {
        return score >= 90 && confidence == Confidence.HIGH;
    }
}
