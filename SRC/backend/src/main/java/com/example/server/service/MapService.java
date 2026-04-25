package com.example.server.service;

import com.example.server.dto.map.GeocodingResponse;
import com.example.server.dto.map.RoutingResponse;
import java.math.BigDecimal;
import java.util.List;

public interface MapService {
    List<GeocodingResponse> searchAddress(String query);
    RoutingResponse getRoute(BigDecimal startLat, BigDecimal startLng, BigDecimal endLat, BigDecimal endLng);
}
