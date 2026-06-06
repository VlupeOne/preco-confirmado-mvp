package br.com.culturatech.precoconfirmado.shared.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class SecurityProblemWriter {
    private final ObjectMapper objectMapper;

    public SecurityProblemWriter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void write(HttpServletRequest request, HttpServletResponse response,
                      int status, String title, String detail) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("type", "https://preco-confirmado.local/problems/" + status);
        body.put("title", title);
        body.put("status", status);
        body.put("detail", detail);
        body.put("instance", request.getRequestURI());
        body.put("timestamp", Instant.now());
        body.put("traceId", MDC.get(CorrelationIdFilter.MDC_KEY));
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
