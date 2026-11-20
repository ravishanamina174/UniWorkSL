package lk.uniwork;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UniWorkApplication {
    public static void main(String[] args) {
        SpringApplication.run(UniWorkApplication.class, args);
    }
}
