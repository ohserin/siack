package com.dakgu.siack.user.service;

import com.dakgu.siack.config.jwt.JwtTokenProvider;
import com.dakgu.siack.user.domain.*;
import com.dakgu.siack.util.ResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final UserValidationService userValidationService;

    /* username 사용 가능한지 확인 */
    public ResponseDTO checkUsernameAvailability(String username) {
        if (!userValidationService.isValidUsernameFormat(username)) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "사용자 이름 형식이 올바르지 않습니다.");
        }
        if (userValidationService.isUsernameDuplicated(username)){
            return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 사용자 이름입니다.");
        }
        return new ResponseDTO(HttpStatus.OK.value(), "사용 가능한 사용자 이름입니다.");
    }

    /* email 사용 가능한지 확인 */
    public ResponseDTO checkEmailAvailability(String email) {
        if (!userValidationService.isValidEmailFormat(email)) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "이메일 형식이 올바르지 않습니다.");
        }
        if (userValidationService.isEmailDuplicated(email)) {
            return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 이메일입니다.");
        }
        return new ResponseDTO(HttpStatus.OK.value(), "사용 가능한 이메일입니다.");
    }

    /* phone 사용 가능한지 확인 */
    public ResponseDTO checkPhoneAvailability(String phone) {
        if (!userValidationService.isValidPhoneNumberFormat(phone)) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "전화번호 형식이 올바르지 않습니다.");
        }
        if (userValidationService.isPhoneNumberDuplicated(phone)) {
            return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 전화번호입니다.");
        }
        return new ResponseDTO(HttpStatus.OK.value(), "사용 가능한 전화번호입니다.");
    }

    /* nickname 사용 가능한지 확인 */
    public ResponseDTO checkNicknameAvailability(String nickname) {
        if (!userValidationService.isValidNicknameFormat(nickname)) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "닉네임 형식이 올바르지 않습니다.");
        }
        if (userValidationService.isNicknameDuplicated(nickname)) {
            return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 닉네임입니다.");
        }
        return new ResponseDTO(HttpStatus.OK.value(), "사용 가능한 닉네임입니다.");
    }

    /* 사용자 회원가입 처리 */
    @Transactional
    public ResponseDTO registerUser(UserRequestDTO request) {
        if (!userValidationService.isValidUsernameFormat(request.getUsername())) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "사용자 이름 형식이 올바르지 않습니다.");
        }
        if (!userValidationService.isValidPasswordFormat(request.getPassword())) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "비밀번호 형식이 올바르지 않습니다. 최소 8자, 소문자, 숫자를 포함해야 합니다.");
        }
        if (!userValidationService.isValidEmailFormat(request.getEmail())) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "이메일 형식이 올바르지 않습니다.");
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty() && !userValidationService.isValidPhoneNumberFormat(request.getPhone())) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "전화번호 형식이 올바르지 않습니다.");
        }
        if (!userValidationService.isValidNicknameFormat(request.getNickname())) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "닉네임 형식이 올바르지 않습니다.");
        }

        if (userValidationService.isUsernameDuplicated(request.getUsername())) {
            return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 사용자 이름입니다.");
        }
        if (userValidationService.isEmailDuplicated(request.getEmail())) {
            return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 이메일입니다.");
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty() && userValidationService.isPhoneNumberDuplicated(request.getPhone())) {
            return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 전화번호입니다.");
        }
        if (userValidationService.isNicknameDuplicated(request.getNickname())) {
            return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 닉네임입니다.");
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

        return new ResponseDTO(HttpStatus.CREATED.value(), "회원가입이 성공적으로 완료되었습니다.");
    }

    /* 사용자 로그인 처리 */
    @Transactional(readOnly = true)
    public ResponseDTO loginUser(UserRequestDTO request) {
        // 1. UsernamePasswordAuthenticationToken 생성
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());

        // 2. 실제 인증 (사용자 비밀번호 검증)
        // authenticate 메서드가 실행될 때 CustomUserDetailsService에서 loadUserByUsername 메서드가 실행됨
        Authentication authentication;
        try {
            authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        } catch (Exception e) {
            // 인증 실패 시 (예: 비밀번호 불일치, 사용자 없음)
            User user = userRepository.findByUsername(request.getUsername());
            if (user == null) {
                return new UserResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자를 찾을 수 없습니다.", null, null, null);
            } else {
                return new UserResponseDTO(HttpStatus.UNAUTHORIZED.value(), "비밀번호가 일치하지 않습니다.", null, null, null);
            }
        }

        // 3. 인증 정보를 기반으로 JWT 토큰 생성
        String jwt = jwtTokenProvider.generateToken(authentication);

        // 사용자 정보 가져오기 (선택 사항)
        User user = userRepository.findByUsername(request.getUsername());
        String nickname = (user != null && user.getUserProfile() != null) ? user.getUserProfile().getNickname() : null;

        // 4. 생성된 토큰과 함께 응답 반환
        return new UserResponseDTO(HttpStatus.OK.value(), "로그인이 성공적으로 완료되었습니다.", jwt, request.getUsername(), nickname);
    }
}
