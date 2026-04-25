package com.example.server.controller;

import com.example.server.dto.map.GeocodingResponse;
import com.example.server.dto.map.RoutingResponse;
import com.example.server.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/public/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    @GetMapping("/search")
    public ResponseEntity<List<GeocodingResponse>> search(@RequestParam String q) {
        return ResponseEntity.ok(mapService.searchAddress(q));
    }

    @GetMapping("/route")
    public ResponseEntity<RoutingResponse> getRoute(
            @RequestParam BigDecimal startLat,
            @RequestParam BigDecimal startLng,
            @RequestParam BigDecimal endLat,
            @RequestParam BigDecimal endLng) {
        return ResponseEntity.ok(mapService.getRoute(startLat, startLng, endLat, endLng));
    }
}
