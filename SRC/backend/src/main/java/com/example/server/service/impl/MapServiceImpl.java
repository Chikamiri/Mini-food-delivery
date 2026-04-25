package com.example.server.service.impl;

import com.example.server.dto.map.GeocodingResponse;
import com.example.server.dto.map.RoutingResponse;
import com.example.server.service.MapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MapServiceImpl implements MapService {

    private final RestClient restClient;

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search?format=json&q={query}";
    private static final String OSRM_URL = "http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson";

    @Override
    public List<GeocodingResponse> searchAddress(String query) {
        log.info("Searching address: {}", query);
        try {
            return restClient.get()
                    .uri(NOMINATIM_URL, query)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<GeocodingResponse>>() {});
        } catch (Exception e) {
            log.error("Error calling Nominatim API: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public RoutingResponse getRoute(BigDecimal startLat, BigDecimal startLng, BigDecimal endLat, BigDecimal endLng) {
        log.info("Getting route from [{},{}] to [{},{}]", startLat, startLng, endLat, endLng);
        try {
            return restClient.get()
                    .uri(OSRM_URL, startLng, startLat, endLng, endLat)
                    .retrieve()
                    .body(RoutingResponse.class);
        } catch (Exception e) {
            log.error("Error calling OSRM API: {}", e.getMessage());
            return null;
        }
    }
}
