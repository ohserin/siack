package com.dakgu.siack.user.service;

import com.dakgu.siack.user.domain.User;
import com.dakgu.siack.user.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority; // 권한 설정을 위한 임포트
import org.springframework.stereotype.Service;

import java.util.Collections; // 단일 권한을 위한 Collections.singletonList 임포트

@Service // Spring 빈으로 등록
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * 사용자 이름(username)을 기반으로 사용자 정보를 로드합니다.
     * Spring Security의 인증 과정에서 호출됩니다.
     *
     * @param username 사용자가 로그인 시 입력한 사용자 이름
     * @return Spring Security가 사용하는 UserDetails 객체
     * @throws UsernameNotFoundException 해당 사용자 이름의 사용자를 찾을 수 없을 경우
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
}
