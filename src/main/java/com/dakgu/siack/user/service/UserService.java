package com.dakgu.siack.user.service;

import com.dakgu.siack.user.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;

    /**
     * 주어진 사용자 이름(userName)이 이미 존재하는지 확인합니다.
     * @param username 중복 확인을 요청하는 사용자 이름
     * @return userName이 이미 존재하면 true, 존재하지 않으면 false
     */
    @Transactional(readOnly = true)
    public boolean checkUsernameDuplication(String username) {
        String usernameRegex = "^(?!.*[_.@]{2,})[a-zA-Z0-9][a-zA-Z0-9_@]{2,48}[a-zA-Z0-9]$";

        if (!Pattern.matches(usernameRegex, username)) return false;
        return userRepository.existsByUsername(username);
    }

    /**
     * 이메일 중복을 확인합니다.
     * @param email 중복 확인할 이메일 주소
     * @return 중복이면 true, 아니면 false
     */
    @Transactional(readOnly = true)
    public boolean checkEmailDuplication(String email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        Pattern pattern = Pattern.compile(emailRegex);
        Matcher matcher = pattern.matcher(email);

        if (!matcher.matches()) return false;
        return userRepository.existsByEmail(email);
    }
}
