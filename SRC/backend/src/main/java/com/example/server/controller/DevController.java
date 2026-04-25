package com.example.server.controller;

import lombok.RequiredArgsConstructor;
import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dev")
@Profile("dev")
@RequiredArgsConstructor
public class DevController {

    private final Flyway flyway;

    @PostMapping("/db/reset")
    public ResponseEntity<?> resetDatabase() {
        flyway.clean();
        flyway.migrate();
        return ResponseEntity.ok(Map.of(
            "message", "Database reset and migrated successfully",
            "status", "SUCCESS"
        ));
    }
}
