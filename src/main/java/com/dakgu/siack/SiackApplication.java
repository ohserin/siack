package com.dakgu.siack;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class SiackApplication {

    @PostConstruct
    public void started(){TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));}
    public static void main(String[] args) {
        SpringApplication.run(SiackApplication.class, args);
    }

}
