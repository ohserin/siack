package com.dakgu.siack.config.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private Key key; // JWT 서명에 사용될 키

    // 객체 초기화 시 secret 값을 Base64 Decode 하여 키 생성
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    /** JWT 토큰 생성 */
    public String generateToken(Authentication authentication) {
        // 인증된 사용자의 권한을 쉼표로 구분된 문자열로 변환
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();
        Date validity = new Date(now + expiration); // 토큰 만료 시간 설정

        // JWT 생성
        return Jwts.builder().subject(authentication.getName()) // 사용자 이름 (Principal)
                .claim("auth", authorities) // 권한 정보 (클레임)
                .issuedAt(new Date(now)).expiration(validity) // 만료 시간
                .signWith(key)
                .compact(); // 토큰 압축
    }

    /** JWT 토큰에서 인증 정보를 추출 */
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parser()
                .verifyWith((SecretKey) key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        // 클레임에서 권한 정보 추출
        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get("auth").toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

        // UserDetails 객체 생성 (여기서는 Spring Security User 클래스 사용)
        UserDetails principal = new User(claims.getSubject(), "", authorities);

        // UsernamePasswordAuthenticationToken 반환
        return new UsernamePasswordAuthenticationToken(principal, "", authorities);
    }

    /** JWT 토큰의 유효성을 검증 */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith((SecretKey) key).build().parseSignedClaims(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("잘못된 JWT 서명입니다.", e);
        } catch (ExpiredJwtException e) {
            log.info("만료된 JWT 토큰입니다.", e);
        } catch (UnsupportedJwtException e) {
            log.info("지원되지 않는 JWT 토큰입니다.", e);
        } catch (IllegalArgumentException e) {
            log.info("JWT 토큰이 잘못되었습니다.", e);
        }
        return false;
    }
}