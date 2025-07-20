package com.dakgu.siack.user.service;

import com.dakgu.siack.user.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;

    public boolean isValidUsernameFormat(String username) {
        String usernameRegex = "^(?!.*[_.@]{2,})[a-zA-Z0-9][a-zA-Z0-9_@]{2,48}[a-zA-Z0-9]$";
        return Pattern.matches(usernameRegex, username);
    }

    public boolean isValidEmailFormat(String email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return Pattern.matches(emailRegex, email);
    }

    /* username 중복 확인 */
    @Transactional(readOnly = true)
    public boolean isUsernameDuplicated(String username) { // 메소드 이름 변경
        return userRepository.existsByUsername(username);
    }

    /* email 중복 확인 */
    @Transactional(readOnly = true)
    public boolean isEmailDuplicated(String email) {
        return userRepository.existsByEmail(email);
    }
}
