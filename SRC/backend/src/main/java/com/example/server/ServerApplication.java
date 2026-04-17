package com.example.server;

import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.example.server.repository.UserRepository;

@SpringBootApplication
public class ServerApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(ServerApplication.class);

		// Optional smoke mode for quick startup checks without requiring MySQL.
		if (isSmokeModeEnabled()) {
			Map<String, Object> defaults = new HashMap<>();
			defaults.put(
					"spring.autoconfigure.exclude",
					"org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
							+ "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,"
							+ "org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration");
			app.setDefaultProperties(defaults);
			System.out.println("[SMOKE MODE] Running without DB/JPA auto-configuration.");
		}

		app.run(args);
	}

	@Bean
	CommandLineRunner runner(UserRepository userRepository) {
		return args -> {
			System.out.println("=======================================");
			System.out.println("   Backend Server Started Successfully  ");
			System.out.println("   Found users count: " + (isSmokeModeEnabled() ? "N/A (Smoke Mode)" : userRepository.count()));
			System.out.println("=======================================");
		};
	}

	private static boolean isSmokeModeEnabled() {
		String env = System.getenv("APP_SMOKE_MODE");
		String prop = System.getProperty("app.smokeMode");
		return "true".equalsIgnoreCase(env) || "true".equalsIgnoreCase(prop);
	}

}
