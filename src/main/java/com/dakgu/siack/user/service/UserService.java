package com.dakgu.siack.user.service;

import com.dakgu.siack.user.domain.*;
import com.dakgu.siack.util.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    private boolean isValidUsernameFormat(String username) {
        String usernameRegex = "^(?!.*[_.@]{2,})[a-zA-Z0-9][a-zA-Z0-9_@]{2,48}[a-zA-Z0-9]$";
        return !Pattern.matches(usernameRegex, username);
    }

    private boolean isValidEmailFormat(String email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return !Pattern.matches(emailRegex, email);
    }

    private boolean isValidPhoneNumberFormat(String phone) {
        String phoneRegex = "^\\d{2,3}-?\\d{3,4}-?\\d{4}$";
        return !Pattern.matches(phoneRegex, phone);
    }

    private boolean isValidNicknameFormat(String nickname) {
        String nicknameRegex = "^[a-zA-Z0-9가-힣_]{2,30}$";
        return !Pattern.matches(nicknameRegex, nickname);
    }

    private boolean isValidPasswordFormat(String password) {
        // 최소 8자, 하나 이상의 소문자, 숫자 포함. 대문자, 특수문자는 선택 사항.
        // [a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{};':\"|,.<>/?~] : 허용되는 문자 집합
        String passwordRegex = "^(?=.*[a-z])(?=.*\\d)[a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{};':\"|,.<>/?~]{8,}$";
        return !Pattern.matches(passwordRegex, password);
    }

    @Transactional(readOnly = true)
    protected boolean isUsernameDuplicated(String username) {
        return userRepository.existsByUsername(username);
    }

    /* email 중복 확인 */
    @Transactional(readOnly = true)
    protected boolean isEmailDuplicated(String email) {
        return userRepository.existsByEmail(email);
    }

    /* 전화번호 중복 확인 */
    @Transactional(readOnly = true)
    protected boolean isPhoneNumberDuplicated(String phone) {
        return userRepository.existsByPhone(phone);
    }

    /* 닉네임 중복 확인 */
    @Transactional(readOnly = true)
    protected boolean isNicknameDuplicated(String nickname) {
        return userProfileRepository.existsByNickname(nickname);
    }

    /* username 사용 가능한지 확인 */
    public ResponseDto checkUsernameAvailability(String username) {
        if (!isValidUsernameFormat(username)) {
            return new ResponseDto(HttpStatus.BAD_REQUEST.value(), "사용자 이름 형식이 올바르지 않습니다.");
        }
        if (isUsernameDuplicated(username)){
            return new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 사용자 이름입니다.");
        }
        return new ResponseDto(HttpStatus.OK.value(), "사용 가능한 사용자 이름입니다.");
    }

    /* email 사용 가능한지 확인 */
    public ResponseDto checkEmailAvailability(String email) {
        if (!isValidEmailFormat(email)) {
            return new ResponseDto(HttpStatus.BAD_REQUEST.value(), "이메일 형식이 올바르지 않습니다.");
        }
        if (isEmailDuplicated(email)) {
            return new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 이메일입니다.");
        }
        return new ResponseDto(HttpStatus.OK.value(), "사용 가능한 이메일입니다.");
    }

    /* phone 사용 가능한지 확인 */
    public ResponseDto checkPhoneAvailability(String phone) {
        if (!isValidPhoneNumberFormat(phone)) {
            return new ResponseDto(HttpStatus.BAD_REQUEST.value(), "전화번호 형식이 올바르지 않습니다.");
        }
        if (isPhoneNumberDuplicated(phone)) {
            return new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 전화번호입니다.");
        }
        return new ResponseDto(HttpStatus.OK.value(), "사용 가능한 전화번호입니다.");
    }

    /* nickname 사용 가능한지 확인 */
    public ResponseDto checkNicknameAvailability(String nickname) {
        if (!isValidNicknameFormat(nickname)) {
            return new ResponseDto(HttpStatus.BAD_REQUEST.value(), "닉네임 형식이 올바르지 않습니다.");
        }
        if (isNicknameDuplicated(nickname)) {
            return new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 닉네임입니다.");
        }
        return new ResponseDto(HttpStatus.OK.value(), "사용 가능한 닉네임입니다.");
    }

    /* 사용자 회원가입 프로세스를 처리 */
    @Transactional
    public ResponseDto registerUser(UserRegisterRequestDto request) {
        if (isValidUsernameFormat(request.getUsername())) {
            return new ResponseDto(HttpStatus.BAD_REQUEST.value(), "사용자 이름 형식이 올바르지 않습니다.");
        }
        if (isValidPasswordFormat(request.getPassword())) {
            return new ResponseDto(HttpStatus.BAD_REQUEST.value(), "비밀번호 형식이 올바르지 않습니다. 최소 8자, 소문자, 숫자를 포함해야 합니다.");
        }
        if (isValidEmailFormat(request.getEmail())) {
            return new ResponseDto(HttpStatus.BAD_REQUEST.value(), "이메일 형식이 올바르지 않습니다.");
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty() && isValidPhoneNumberFormat(request.getPhone())) {
            return new ResponseDto(HttpStatus.BAD_REQUEST.value(), "전화번호 형식이 올바르지 않습니다.");
        }
        if (isValidNicknameFormat(request.getNickname())) {
            return new ResponseDto(HttpStatus.BAD_REQUEST.value(), "닉네임 형식이 올바르지 않습니다.");
        }

        if (isUsernameDuplicated(request.getUsername())) {
            return new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 사용자 이름입니다.");
        }
        if (isEmailDuplicated(request.getEmail())) {
            return new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 이메일입니다.");
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty() && isPhoneNumberDuplicated(request.getPhone())) {
            return new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 전화번호입니다.");
        }
        if (isNicknameDuplicated(request.getNickname())) {
            return new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 닉네임입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User newUser = new User(
                request.getUsername(),
                encodedPassword,
                request.getEmail(),
                request.getPhone()
        );
        User savedUser = userRepository.save(newUser);

        UserProfile newUserProfile = new UserProfile(
                savedUser,
                request.getNickname(),
                null,
                null
        );
        userProfileRepository.save(newUserProfile);

        savedUser.setUserProfile(newUserProfile);

        return new ResponseDto(HttpStatus.CREATED.value(), "회원가입이 성공적으로 완료되었습니다.");
    }

}
