package com.example.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class MapClientConfig {

    @Bean
    public RestClient restClient(RestClient.Builder builder) {
        return builder
                .defaultHeader("User-Agent", "MiniFoodDeliveryApp/1.0 (contact@example.com)")
                .build();
    }
}
