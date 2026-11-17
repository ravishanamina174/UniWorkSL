package lk.uniwork.security;

import lk.uniwork.common.ApiError;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${uniwork.web-origin:http://localhost:3000}") String webOrigin) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(webOrigin));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    JwtDecoder jwtDecoder(@Value("${uniwork.security.clerk-issuer-uri:}") String issuerUri) {
        if (issuerUri == null || issuerUri.isBlank()) {
            return token -> { throw new BadJwtException("Clerk issuer is not configured."); };
        }
        return NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
    }

    @Bean
    SecurityFilterChain apiSecurity(HttpSecurity http, ObjectProvider<JwtDecoder> decoderProvider, ObjectMapper objectMapper) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/health", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/actuator/health").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/public/tasks", "/api/v1/public/tasks/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            objectMapper.writeValue(response.getOutputStream(), new ApiError(401, "UNAUTHENTICATED", "Authentication is required.", Instant.now()));
                        })
                        .accessDeniedHandler((request, response, exception) -> {
                            response.setStatus(403);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            objectMapper.writeValue(response.getOutputStream(), new ApiError(403, "FORBIDDEN", "You are not allowed to access this resource.", Instant.now()));
                        }));
        JwtDecoder decoder = decoderProvider.getIfAvailable();
        http.oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.decoder(decoder)));
        return http.build();
    }
}
