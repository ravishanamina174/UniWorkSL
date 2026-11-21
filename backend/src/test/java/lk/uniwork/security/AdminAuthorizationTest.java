package lk.uniwork.security;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class AdminAuthorizationTest {
    private JwtAuthenticationToken token() {
        return new JwtAuthenticationToken(Jwt.withTokenValue("signed-token").header("alg","RS256").subject("user_admin").build(),
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("SCOPE_user")));
    }

    @Test void checksCurrentPublicMetadataForEachRequestIncludingRoleRemoval() {
        RestClient.Builder builder=RestClient.builder();
        MockRestServiceServer server=MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://clerk.example/v1/users/user_admin"))
                .andExpect(header("Authorization","Bearer test-key"))
                .andRespond(withSuccess("{\"public_metadata\":{\"role\":\"Admin\"}}",MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://clerk.example/v1/users/user_admin"))
                .andRespond(withSuccess("{\"public_metadata\":{\"role\":\"Task Poster\"}}",MediaType.APPLICATION_JSON));
        AdminAuthorization access=new AdminAuthorization(builder,new ObjectMapper(),"test-key","https://clerk.example/v1");
        assertTrue(token().isAuthenticated());
        assertTrue(access.isAdmin(token()));
        assertFalse(access.isAdmin(token()));
        server.verify();
    }

    @Test void failsClosedWithoutServerCredential() {
        assertFalse(new AdminAuthorization(RestClient.builder(),new ObjectMapper(),"","https://clerk.example/v1").isAdmin(token()));
    }

    @Test void requiresExactCaseSensitivePublicMetadataRole() {
        RestClient.Builder builder=RestClient.builder();
        MockRestServiceServer server=MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo("https://clerk.example/v1/users/user_admin"))
                .andRespond(withSuccess("{\"public_metadata\":{\"role\":\"admin\"}}",MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://clerk.example/v1/users/user_admin"))
                .andRespond(withSuccess("{\"public_metadata\":{}}",MediaType.APPLICATION_JSON));
        AdminAuthorization access=new AdminAuthorization(builder,new ObjectMapper(),"test-key","https://clerk.example/v1");
        assertFalse(access.isAdmin(token()));
        assertFalse(access.isAdmin(token()));
        server.verify();
    }
}
