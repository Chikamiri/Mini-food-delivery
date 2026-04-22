package com.example.server;

import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import com.example.server.repository.UserRepository;

@SpringBootApplication
public class ServerApplication {

	public static void main(String[] args) {
		// Load .env variables into system properties if .env exists
		try {
			// Check current directory first, then SRC/backend/
			Dotenv dotenv = Dotenv.configure()
					.ignoreIfMissing()
					.load();
			
			// If no entries found in current dir, try SRC/backend
			if (dotenv.entries().isEmpty()) {
				dotenv = Dotenv.configure()
						.directory("SRC/backend")
						.ignoreIfMissing()
						.load();
			}

			dotenv.entries().forEach(entry -> {
				if (System.getProperty(entry.getKey()) == null) {
					System.setProperty(entry.getKey(), entry.getValue());
				}
			});
		} catch (Exception e) {
			System.err.println("Warning: Could not load .env file: " + e.getMessage());
		}

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
	CommandLineRunner runner(
			org.springframework.beans.factory.ObjectProvider<UserRepository> userRepositoryProvider,
			org.springframework.beans.factory.ObjectProvider<DataSource> dataSourceProvider,
			Environment env) {
		return args -> {
			String port = env.getProperty("local.server.port");
			if (port == null)
				port = env.getProperty("server.port", "8080");
			String baseUrl = "http://localhost:" + port;

			System.out.println("\n====================================================================");
			System.out.println("🚀  Mini Food Delivery Backend Started Successfully!");
			System.out.println("🔗  API Base URL (for frontend): " + baseUrl + "/api");
			System.out.println("📖  Swagger Documentation:      " + baseUrl + "/swagger-ui.html");
			System.out.println("--------------------------------------------------------------------");

			if (isSmokeModeEnabled()) {
				System.out.println("📁  Database: SKIPPED (Smoke Mode enabled)");
			} else {
				dataSourceProvider.ifAvailable(dataSource -> {
					try (Connection conn = dataSource.getConnection()) {
						System.out.println(
								"✅  Database: CONNECTED (" + conn.getMetaData().getDatabaseProductName() + ")");
						userRepositoryProvider.ifAvailable(
								repo -> System.out.println("📊  Statistics: " + repo.count() + " users registered"));
					} catch (Exception e) {
						System.err.println("❌  Database: CONNECTION FAILED!");
						System.err.println("    Error: " + e.getMessage());
					}
				});

				if (dataSourceProvider.getIfAvailable() == null) {
					System.err.println("❌  Database: NOT CONFIGURED!");
				}
			}
			System.out.println("====================================================================\n");
		};
	}

	private static boolean isSmokeModeEnabled() {
		String env = System.getenv("APP_SMOKE_MODE");
		String prop = System.getProperty("app.smokeMode");
		return "true".equalsIgnoreCase(env) || "true".equalsIgnoreCase(prop);
	}

}
