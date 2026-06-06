package br.com.culturatech.precoconfirmado.provider.mock;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Profile("dev")
@RestController
@RequestMapping("/api/v1/dev/mock-offers")
@Tag(name = "Development")
public class MockOfferController {
    private final MockOfferService service;

    public MockOfferController(MockOfferService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    MockOfferResponse create(@Valid @RequestBody MockOfferRequest request) {
        return service.create(request);
    }

    @PutMapping("/{externalId}")
    MockOfferResponse update(@PathVariable String externalId, @Valid @RequestBody MockOfferRequest request) {
        return service.update(externalId, request);
    }

    @GetMapping
    List<MockOfferResponse> list() {
        return service.list();
    }

    @GetMapping("/{externalId}")
    MockOfferResponse get(@PathVariable String externalId) {
        return service.get(externalId);
    }

    @DeleteMapping("/{externalId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable String externalId) {
        service.delete(externalId);
    }
}
