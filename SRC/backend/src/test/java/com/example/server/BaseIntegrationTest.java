package com.example.server;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.MySQLContainer;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.DockerClientFactory;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @ServiceConnection
    static MySQLContainer<?> mysql;

    static {
        if (!DockerClientFactory.instance().isDockerAvailable()) {
            System.err.println("\n====================================================================");
            System.err.println("❌ ERROR: Docker is not running or not accessible!");
            System.err.println("❌ Integration tests require Docker to run MySQL via Testcontainers.");
            System.err.println("❌ Please start your Docker service and try again.");
            System.err.println("====================================================================\n");
            // Prevent container initialization attempt
        } else {
            mysql = new MySQLContainer<>("mysql:8.0")
                    .withDatabaseName("testdb")
                    .withUsername("testuser")
                    .withPassword("testpass");
            mysql.start();
        }
    }
}
