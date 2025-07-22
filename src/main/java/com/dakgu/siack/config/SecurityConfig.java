package com.dakgu.siack.config;

import com.dakgu.siack.config.jwt.JwtAuthenticationFilter;
import com.dakgu.siack.config.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig implements WebMvcConfigurer {

    private final JwtTokenProvider jwtTokenProvider;

    /**
     * HTTP 보안 필터 체인을 구성하는 Bean 입니다.
     * 이 메서드는 애플리케이션의 HTTP 요청에 대한 보안 규칙을 정의합니다.
     *
     * @param http HttpSecurity 객체로, HTTP 요청에 대한 보안 설정을 구성하는 데 사용됩니다.
     * @return 구성된 SecurityFilterChain 객체
     * @throws Exception 보안 구성 중 발생할 수 있는 예외
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // corsConfigurationSource() 메서드에서 정의된 CORS 정책을 사용
                   .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // CSRF (Cross-Site Request Forgery) 보호를 비활성화 (API 서버와 같이 세션 기반 인증을 사용하지 않는 경우 일반적으로 비활성화)
                .csrf(AbstractHttpConfigurer::disable)
                // 세션을 사용하지 않고 JWT를 사용하여 인증하므로 세션 생성 정책을 STATELESS로 설정
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // HTTP 요청에 대한 권한 부여 규칙을 설정
                .authorizeHttpRequests(authorize -> authorize
                        // /v1/user/ 하위의 모든 경로는 인증 없이 접근 허용 (접근 허용하려면 콤마로 구분해서 추가
                        .requestMatchers("/v1/user/**").permitAll()
                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )
                // JWT 인증 필터를 UsernamePasswordAuthenticationFilter 이전에 추가
                // 이 필터는 요청 헤더에서 JWT를 검증하고 SecurityContextHolder에 인증 정보를 설정합니다.
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * CORS (Cross-Origin Resource Sharing) 설정을 정의하는 Bean 입니다.
     * 이 메서드는 어떤 출처(Origin), HTTP 메서드, 헤더를 허용할지 등을 설정합니다.
     *
     * @return 구성된 CorsConfigurationSource 객체
     */
    @Bean // CORS 설정 메소드
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 출처(도메인)를 설정합니다.
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        // 허용할 HTTP 메서드를 설정합니다 (GET, POST, PUT, DELETE, OPTIONS 등).
        // OPTIONS는 Preflight 요청에 사용되므로 반드시 포함해야 함.
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // 허용할 요청 헤더를 설정합니다.
        configuration.setAllowedHeaders(List.of("*"));

        // JWT 토큰을 주고받기 위해 Authorization 헤더를 노출하도록 설정 (클라이언트에서 접근 가능하도록)
        configuration.setExposedHeaders(List.of("Authorization"));

        // 클라이언트가 자격 증명(쿠키, HTTP 인증 헤더 등)을 요청에 포함할 수 있도록 허용합니다.
        configuration.setAllowCredentials(true);

        // Preflight 요청(실제 요청 전에 브라우저가 보내는 사전 검증 요청)의 결과를 캐시할 최대 시간(초)을 설정합니다.
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        // "/**" (모든 경로)에 대해 위에서 정의한 CORS 설정을 적용합니다.
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
