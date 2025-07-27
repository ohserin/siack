package com.dakgu.siack.config.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    /**
     * HTTP 요청당 한 번만 실행되는 필터 로직을 구현합니다.
     * 이 필터는 HTTP 요청 헤더에서 JWT 토큰을 추출하고 유효성을 검증하여
     * Spring Security의 SecurityContext에 인증 정보를 설정합니다.
     *
     * @param request HTTP 서블릿 요청 객체
     * @param response HTTP 서블릿 응답 객체
     * @param filterChain 필터 체인
     * @throws ServletException 서블릿 예외
     * @throws IOException 입출력 예외
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // 1. Request Header에서 JWT 토큰 추출
        String token = resolveToken(request);

        // 2. validateToken으로 토큰 유효성 검사
        if (token != null && jwtTokenProvider.validateToken(token)) {
            // 토큰이 유효할 경우 토큰에서 Authentication 객체를 가져와 SecurityContext에 저장
            Authentication authentication = jwtTokenProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    /** Request Header에서 토큰 정보를 추출합니다. */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization"); // Authorization 헤더에서 토큰 가져오기
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer")) {
            return bearerToken.substring(7); // "Bearer " (7자) 이후의 문자열 반환
        }
        return null;
    }
}
