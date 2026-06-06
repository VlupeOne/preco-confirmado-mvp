package br.com.culturatech.precoconfirmado;

import org.junit.jupiter.api.Test;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ManifestSyntaxTest {
    @Test
    void parsesProjectYamlFiles() throws IOException {
        Path backendRoot = Path.of(System.getProperty("user.dir"));
        Path repositoryRoot = backendRoot.getParent();
        List<Path> files = List.of(
                backendRoot.resolve("docker-compose.yml"),
                repositoryRoot.resolve(".github/workflows/backend-ci.yml"),
                backendRoot.resolve("src/main/resources/application.yml"),
                backendRoot.resolve("src/main/resources/application-dev.yml"),
                backendRoot.resolve("src/main/resources/application-test.yml"),
                backendRoot.resolve("src/main/resources/application-prod.yml")
        );
        Yaml yaml = new Yaml();
        for (Path file : files) {
            try (Reader reader = Files.newBufferedReader(file)) {
                assertThat(yaml.loadAll(reader)).as(file.toString()).isNotEmpty();
            }
        }
    }
}
