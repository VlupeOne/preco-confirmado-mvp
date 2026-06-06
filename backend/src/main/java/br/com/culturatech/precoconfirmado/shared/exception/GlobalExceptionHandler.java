package br.com.culturatech.precoconfirmado.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NotFoundException.class)
    ProblemDetail notFound(NotFoundException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Recurso não encontrado", exception.getMessage(), request);
    }

    @ExceptionHandler({ConflictException.class, DataIntegrityViolationException.class})
    ProblemDetail conflict(Exception exception, HttpServletRequest request) {
        String detail = exception instanceof ConflictException
                ? exception.getMessage()
                : "A operação viola uma restrição de unicidade ou integridade.";
        return problem(HttpStatus.CONFLICT, "Conflito", detail, request);
    }

    @ExceptionHandler(ProviderException.class)
    ProblemDetail provider(ProviderException exception, HttpServletRequest request) {
        HttpStatus status = exception.isRateLimited() ? HttpStatus.TOO_MANY_REQUESTS : HttpStatus.SERVICE_UNAVAILABLE;
        return problem(status, "Provedor indisponível", exception.getMessage(), request);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class})
    ProblemDetail validation(Exception exception, HttpServletRequest request) {
        ProblemDetail detail = problem(HttpStatus.BAD_REQUEST, "Dados inválidos",
                "Revise os campos informados.", request);
        if (exception instanceof MethodArgumentNotValidException invalid) {
            List<Map<String, String>> violations = invalid.getBindingResult().getFieldErrors().stream()
                    .map(error -> Map.of("field", error.getField(), "message",
                            error.getDefaultMessage() == null ? "invalid" : error.getDefaultMessage()))
                    .toList();
            detail.setProperty("violations", violations);
        } else if (exception instanceof ConstraintViolationException invalid) {
            List<Map<String, String>> violations = invalid.getConstraintViolations().stream()
                    .map(violation -> Map.of(
                            "field", violation.getPropertyPath().toString(),
                            "message", violation.getMessage()))
                    .toList();
            detail.setProperty("violations", violations);
        }
        return detail;
    }

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class
    })
    ProblemDetail malformedRequest(Exception exception, HttpServletRequest request) {
        return problem(HttpStatus.BAD_REQUEST, "Requisição inválida",
                "O corpo ou os parâmetros da requisição são inválidos.", request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ProblemDetail routeNotFound(NoResourceFoundException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Rota não encontrada",
                "O recurso solicitado não existe.", request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ProblemDetail forbidden(AccessDeniedException exception, HttpServletRequest request) {
        return problem(HttpStatus.FORBIDDEN, "Acesso negado", "Permissão insuficiente.", request);
    }

    @ExceptionHandler(AuthenticationException.class)
    ProblemDetail unauthorized(AuthenticationException exception, HttpServletRequest request) {
        return problem(HttpStatus.UNAUTHORIZED, "Não autenticado", "Credenciais inválidas.", request);
    }

    @ExceptionHandler(BadRequestException.class)
    ProblemDetail badRequest(BadRequestException exception, HttpServletRequest request) {
        return problem(HttpStatus.BAD_REQUEST, "Requisição inválida", exception.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail internal(Exception exception, HttpServletRequest request) {
        log.error("Unhandled request error: method={} path={} traceId={}",
                request.getMethod(), request.getRequestURI(), MDC.get("traceId"), exception);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno",
                "Não foi possível concluir a operação.", request);
    }

    private ProblemDetail problem(HttpStatus status, String title, String message, HttpServletRequest request) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(status, message);
        detail.setTitle(title);
        detail.setType(URI.create("https://preco-confirmado.local/problems/" + status.value()));
        detail.setInstance(URI.create(request.getRequestURI()));
        detail.setProperty("timestamp", Instant.now());
        detail.setProperty("traceId", MDC.get("traceId"));
        return detail;
    }
}
