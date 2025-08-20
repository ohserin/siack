package com.dakgu.siack.remote.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * application.yml 또는 application.properties 파일에서 SSH 연결 정보를 읽어와 관리하는 클래스입니다.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "ssh") // "ssh" 접두사를 가진 설정을 매핑
public class SshConfig {

    private String host;
    private int port = 22;
    private String username;
    private String privateKeyPath;
    private int sessionTimeout = 10000;
    private int channelTimeout = 5000;
    private String uploadPath;

}
