package br.com.culturatech.precoconfirmado;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@ConfigurationPropertiesScan
@SpringBootApplication
public class PrecoConfirmadoApplication {

    public static void main(String[] args) {
        SpringApplication.run(PrecoConfirmadoApplication.class, args);
    }
}
