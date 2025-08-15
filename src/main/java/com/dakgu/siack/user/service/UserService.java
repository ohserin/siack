package com.dakgu.siack.user.service;

import com.dakgu.siack.config.jwt.JwtTokenProvider;
import com.dakgu.siack.user.dto.UserRequestDTO;
import com.dakgu.siack.user.dto.UserResponseDTO;
import com.dakgu.siack.user.entity.User;
import com.dakgu.siack.user.entity.UserProfile;
import com.dakgu.siack.user.repository.UserProfileRepository;
import com.dakgu.siack.user.repository.UserRepository;
import com.dakgu.siack.utils.ResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
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

        log.info("[알림] 유저 회원가입: {} / {}", request.getUsername(), request.getNickname());

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
        } catch (UsernameNotFoundException e) {
            return new UserResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자를 찾을 수 없습니다.", null, null, null);
        } catch (BadCredentialsException e) {
            return new UserResponseDTO(HttpStatus.UNAUTHORIZED.value(), "비밀번호가 일치하지 않습니다.", null, null, null);
        }

        // 3. 인증 정보를 기반으로 JWT 토큰 생성
        String jwt = jwtTokenProvider.generateToken(authentication);

        // 사용자 정보 가져오기 (선택 사항)
        User user = userRepository.findByUsername(request.getUsername());
        String nickname = (user != null && user.getUserProfile() != null) ? user.getUserProfile().getNickname() : null;

        assert user != null;
        log.info("[알림] 유저 로그인: {} / {}", user.getUsername(), nickname);

        // 4. 생성된 토큰과 함께 응답 반환
        return new UserResponseDTO(HttpStatus.OK.value(), "로그인이 성공적으로 완료되었습니다.", jwt, request.getUsername(), nickname);
    }

    public ResponseDTO getUserData(Authentication authentication) {
        String username = authentication.getName();

        if (username == null) {
            return new ResponseDTO(HttpStatus.UNAUTHORIZED.value(), "인증되지 않은 사용자입니다.");
        }

        User user = userRepository.findByUsername(username);
        if (user == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");
        }

        UserProfile profile  = userProfileRepository.findByUserid(user.getUserid());
        if (profile  == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "프로필 정보가 존재하지 않습니다.");
        }

        return new UserResponseDTO(
                HttpStatus.OK.value(),
                "success",
                user.getUserid(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                profile.getNickname(),
                profile.getProfileimg(),
                profile.getStatusmsg(),
                user.getRole()
        );
    }

    @Transactional
    public ResponseDTO setUserData(Authentication authentication, UserRequestDTO request) {
        String username = authentication.getName();
        if (username == null) {
            return new ResponseDTO(HttpStatus.UNAUTHORIZED.value(), "인증되지 않은 사용자입니다.");
        }

        User user = userRepository.findByUsername(username);
        if (user == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");
        }

        UserProfile profile = userProfileRepository.findByUserid(user.getUserid());
        if (profile == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "프로필 정보가 존재하지 않습니다.");
        }

        String currentEmail = user.getEmail();
        String currentPhone = user.getPhone();
        String currentNickname = profile.getNickname();

        String email = request.getEmail();
        String phone = request.getPhone() != null ? request.getPhone().trim() : null;
        String nickname = request.getNickname();

        boolean changed = false;

        // 이메일 검증
        if (email != null && !email.isEmpty() && !email.equals(currentEmail)) {
            if (!userValidationService.isValidEmailFormat(email)) {
                return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "이메일 형식이 올바르지 않습니다.");
            }
            if (userValidationService.isEmailDuplicated(email)) {
                return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 이메일입니다.");
            }
            changed = true;
        } else {
            email = currentEmail;
        }

        // 전화번호 검증
        if (phone != null && !phone.isEmpty() && !phone.equals(currentPhone)) {
            if (!userValidationService.isValidPhoneNumberFormat(phone)) {
                return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "전화번호 형식이 올바르지 않습니다.");
            }
            if (userValidationService.isPhoneNumberDuplicated(phone)) {
                return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 전화번호입니다.");
            }
            changed = true;
        } else {
            phone = currentPhone;
        }

        // 닉네임 검증
        if (nickname != null && !nickname.isEmpty() && !nickname.equals(currentNickname)) {
            if (!userValidationService.isValidNicknameFormat(nickname)) {
                return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "닉네임 형식이 올바르지 않습니다.");
            }
            if (userValidationService.isNicknameDuplicated(nickname)) {
                return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 닉네임입니다.");
            }
            changed = true;
        } else {
            nickname = currentNickname;
        }

        // 변경사항 없으면 패스
        if (!changed) {
            return new ResponseDTO(HttpStatus.OK.value(), "변경된 정보가 없습니다.");
        }

        updateUserInfo(user.getUserid(), nickname, phone, email);

        log.info("[알림] 유저 정보 업데이트: {}", user.getUsername());
        return new ResponseDTO(HttpStatus.OK.value(), "사용자 정보가 성공적으로 업데이트되었습니다.");
    }

    @Transactional
    protected void updateUserInfo(Long userid, String nickname, String phone, String email) {
        if (nickname != null) userProfileRepository.updateNickname(userid, nickname);
        if (email != null) userRepository.updateEmail(userid, email);
        userRepository.updatePhone(userid, phone);
    }

}
