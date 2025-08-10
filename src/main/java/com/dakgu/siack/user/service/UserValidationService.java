package com.dakgu.siack.user.service;

import com.dakgu.siack.user.repository.UserProfileRepository;
import com.dakgu.siack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@RequiredArgsConstructor
@Service
public class UserValidationService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    // 사용자 이름 형식 유효성 검사
    public boolean isValidUsernameFormat(String username) {
        String usernameRegex = "^(?!.*[_.@]{2,})[a-zA-Z0-9][a-zA-Z0-9_@]{2,48}[a-zA-Z0-9]$";
        return Pattern.matches(usernameRegex, username);
    }

    // 이메일 형식 유효성 검사
    public boolean isValidEmailFormat(String email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return Pattern.matches(emailRegex, email);
    }

    // 전화번호 형식 유효성 검사
    public boolean isValidPhoneNumberFormat(String phone) {
        String phoneRegex = "^\\d{2,3}-?\\d{3,4}-?\\d{4}$";
        return Pattern.matches(phoneRegex, phone);
    }

    // 닉네임 형식 유효성 검사
    public boolean isValidNicknameFormat(String nickname) {
        String nicknameRegex = "^[a-zA-Z0-9가-힣_]{2,30}$";
        return Pattern.matches(nicknameRegex, nickname);
    }

    // 비밀번호 형식 유효성 검사
    public boolean isValidPasswordFormat(String password) {
        String passwordRegex = "^(?=.*[a-z])(?=.*\\d)[a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{};':\"|,.<>/?~]{8,}$";
        return Pattern.matches(passwordRegex, password);
    }

    /* 사용자 이름 중복 확인 */
    @Transactional(readOnly = true)
    public boolean isUsernameDuplicated(String username) {
        return userRepository.existsByUsername(username);
    }

    /* 이메일 중복 확인 */
    @Transactional(readOnly = true)
    public boolean isEmailDuplicated(String email) {
        return userRepository.existsByEmail(email);
    }

    /* 전화번호 중복 확인 */
    @Transactional(readOnly = true)
    public boolean isPhoneNumberDuplicated(String phone) {
        return userRepository.existsByPhone(phone);
    }

    /* 닉네임 중복 확인 */
    @Transactional(readOnly = true)
    public boolean isNicknameDuplicated(String nickname) {
        return userProfileRepository.existsByNickname(nickname);
    }
}
