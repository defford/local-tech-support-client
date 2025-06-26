package com.localtechsupport.cli.client;

import com.localtechsupport.cli.model.TicketStatistics;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;

/**
 * Comprehensive unit tests for TechSupportApiClient
 */
class TechSupportApiClientTest {

    private MockWebServer mockWebServer;
    private TechSupportApiClient apiClient;
    private String baseUrl;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
        baseUrl = mockWebServer.url("/").toString();
        baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        apiClient = new TechSupportApiClient(baseUrl);
    }

    @AfterEach
    void tearDown() throws IOException {
        apiClient.close();
        mockWebServer.shutdown();
    }

    @Nested
    @DisplayName("Constructor Tests")
    class ConstructorTests {

        @Test
        @DisplayName("Should handle base URL with trailing slash")
        void shouldHandleBaseUrlWithTrailingSlash() {
            String urlWithSlash = "http://localhost:8080/";
            TechSupportApiClient client = new TechSupportApiClient(urlWithSlash);
            assertThat(client.getBaseUrl()).isEqualTo("http://localhost:8080");
            client.close();
        }

        @Test
        @DisplayName("Should return configured base URL")
        void shouldReturnConfiguredBaseUrl() {
            assertThat(apiClient.getBaseUrl()).isEqualTo(baseUrl);
        }
    }

    @Nested
    @DisplayName("Successful API Call Tests")
    class SuccessfulApiCallTests {

        @Test
        @DisplayName("Should successfully fetch ticket statistics")
        void shouldSuccessfullyFetchTicketStatistics() throws Exception {
            String mockResponseJson = """
                {
                    "totalTickets": 150,
                    "openTickets": 45,
                    "resolvedTickets": 60,
                    "averageResolutionTimeHours": 24.5,
                    "ticketsResolvedToday": 12
                }
                """;

            mockWebServer.enqueue(new MockResponse()
                .setBody(mockResponseJson)
                .setHeader("Content-Type", "application/json")
                .setResponseCode(200));

            ApiResponse<TicketStatistics> response = apiClient.get("/api/tickets/statistics", TicketStatistics.class);

            assertThat(response).isNotNull();
            assertThat(response.isSuccessful()).isTrue();
            assertThat(response.getStatusCode()).isEqualTo(200);
            
            TicketStatistics stats = response.getData();
            assertThat(stats.getTotalTickets()).isEqualTo(150L);
            assertThat(stats.getOpenTickets()).isEqualTo(45L);
            assertThat(stats.getResolvedTickets()).isEqualTo(60L);
        }

        @Test
        @DisplayName("Should include proper request headers")
        void shouldIncludeProperRequestHeaders() throws Exception {
            mockWebServer.enqueue(new MockResponse()
                .setBody("{}")
                .setResponseCode(200));

            apiClient.get("/api/test", Object.class);

            RecordedRequest request = mockWebServer.takeRequest(1, TimeUnit.SECONDS);
            assertThat(request.getHeader("Accept")).isEqualTo("application/json");
            assertThat(request.getHeader("User-Agent")).isEqualTo("TechSupport-CLI/1.0");
            assertThat(request.getMethod()).isEqualTo("GET");
        }
    }

    @Nested
    @DisplayName("Error Handling Tests")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should throw ApiException for 404")
        void shouldThrowApiExceptionFor404() {
            mockWebServer.enqueue(new MockResponse()
                .setBody("Resource not found")
                .setResponseCode(404));

            assertThatThrownBy(() -> apiClient.get("/api/nonexistent", Object.class))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("API call failed with status 404");
        }

        @Test
        @DisplayName("Should include status code in exception for HTTP errors")
        void shouldIncludeStatusCodeInExceptionForHttpErrors() {
            mockWebServer.enqueue(new MockResponse()
                .setBody("Bad request")
                .setResponseCode(400));

            assertThatThrownBy(() -> apiClient.get("/api/bad", Object.class))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("API call failed with status 400")
                .hasMessageContaining("Bad request");
        }

        @Test
        @DisplayName("Should handle network errors")
        void shouldHandleNetworkErrors() throws IOException {
            mockWebServer.shutdown();

            assertThatThrownBy(() -> apiClient.get("/api/test", Object.class))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Network error");
        }

        @Test
        @DisplayName("Should handle empty response body with JSON parsing error")
        void shouldHandleEmptyResponseBodyWithJsonParsingError() {
            mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200));

            assertThatThrownBy(() -> apiClient.get("/api/empty", Object.class))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Network error")
                .hasMessageContaining("No content to map");
        }
    }

    @Nested
    @DisplayName("Connection Tests")
    class ConnectionTests {

        @Test
        @DisplayName("Should return true for successful health check")
        void shouldReturnTrueForSuccessfulHealthCheck() {
            mockWebServer.enqueue(new MockResponse()
                .setBody("{\"status\":\"UP\"}")
                .setResponseCode(200));

            boolean isConnected = apiClient.testConnection();
            assertThat(isConnected).isTrue();
        }

        @Test
        @DisplayName("Should return false for failed health check")
        void shouldReturnFalseForFailedHealthCheck() {
            mockWebServer.enqueue(new MockResponse()
                .setResponseCode(503));

            boolean isConnected = apiClient.testConnection();
            assertThat(isConnected).isFalse();
        }

        @Test
        @DisplayName("Should make request to correct health endpoint")
        void shouldMakeRequestToCorrectHealthEndpoint() throws Exception {
            mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200));

            apiClient.testConnection();

            RecordedRequest request = mockWebServer.takeRequest(1, TimeUnit.SECONDS);
            assertThat(request.getPath()).isEqualTo("/actuator/health");
        }
    }

    @Nested
    @DisplayName("Resource Management")
    class ResourceManagementTests {

        @Test
        @DisplayName("Should close resources without exception")
        void shouldCloseResourcesWithoutException() {
            assertThatCode(() -> apiClient.close()).doesNotThrowAnyException();
        }
    }
}
