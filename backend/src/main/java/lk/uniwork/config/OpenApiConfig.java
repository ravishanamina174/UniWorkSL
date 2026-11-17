package lk.uniwork.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI uniWorkOpenApi() {
        return new OpenAPI().info(new Info().title("UniWork API").version("v1")
                .description("Shared REST API for UniWork web and mobile clients."));
    }
}
