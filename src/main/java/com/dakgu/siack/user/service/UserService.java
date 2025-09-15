package com.dakgu.siack.user.service;

import com.dakgu.siack.config.jwt.JwtTokenProvider;
import com.dakgu.siack.file.repository.SdfFileRepository;
import com.dakgu.siack.file.service.FileService;
import com.dakgu.siack.file.service.FileUploadService;
import com.dakgu.siack.log.service.UserLogService;
import com.dakgu.siack.log.vo.UserLog;
import com.dakgu.siack.user.dto.UserRequestDTO;
import com.dakgu.siack.user.dto.UserResponseDTO;
import com.dakgu.siack.user.dto.UserProfileUrlResponseDTO;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.user.vo.UserProfile;
import com.dakgu.siack.user.repository.UserProfileRepository;
import com.dakgu.siack.user.repository.UserRepository;
import com.dakgu.siack.utils.ResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserService {

    @Value("${ssh.host}")
    private String HOST;

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final UserValidationService userValidationService;
    private final FileUploadService uploadService;
    private final SdfFileRepository fileRepository;
    private final FileService fileService;
    private final UserLogService userLogService;

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

        String encodedPassword = encodePassword(request.getPassword());

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

        // 회원가입 성공 로그
        UserLog userLog = new UserLog();
        userLog.setUserid(savedUser.getUserid().intValue());
        userLog.setActiontype("REGISTER");
        userLog.setStatus(0); // 0: 성공
        userLog.setContent("회원가입 성공");
        userLogService.saveLog(userLog);

        log.info("[알림] 유저 회원가입: {} / {}", request.getUsername(), request.getNickname());

        return new ResponseDTO(HttpStatus.CREATED.value(), "회원가입이 성공적으로 완료되었습니다.");
    }

    /* 사용자 로그인 처리 */
    @Transactional
    public ResponseDTO loginUser(UserRequestDTO request) {
        // 1. 유저 아이디로 활성 계정 조회
        User user = userRepository.findByUsernameAndUseyn(request.getUsername(), true);
        if (user == null) {
            return new UserResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자를 찾을 수 없습니다.", null, null, null);
        }
        // 2. 인증 (비밀번호 검증)
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
        Authentication authentication;
        try {
            authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        } catch (BadCredentialsException e) {
            UserLog userLog = new UserLog();
            userLog.setUserid(user.getUserid().intValue());
            userLog.setActiontype("LOGIN_FAIL");
            userLog.setStatus(1); // 1: 실패
            userLog.setContent("로그인 실패: 비밀번호 불일치");
            userLogService.saveLog(userLog);
            return new UserResponseDTO(HttpStatus.UNAUTHORIZED.value(), "비밀번호가 일치하지 않습니다.", null, null, null);
        }
        // 3. JWT 토큰 생성
        String jwt = jwtTokenProvider.generateToken(authentication);
        String nickname = (user.getUserProfile() != null) ? user.getUserProfile().getNickname() : null;
        // 4. 로그인 성공 로그
        UserLog userLog = new UserLog();
        userLog.setUserid(user.getUserid().intValue());
        userLog.setActiontype("LOGIN");
        userLog.setStatus(0); // 0: 성공
        userLog.setContent("로그인 성공");
        userLogService.saveLog(userLog);
        log.info("[알림] 유저 로그인: {} / {}", user.getUsername(), nickname);
        // 5. 응답 반환
        return new UserResponseDTO(HttpStatus.OK.value(), "로그인이 성공적으로 완료되었습니다.", jwt, request.getUsername(), nickname);
    }

    /**
     * 인증 객체에서 사용자(User)를 조회합니다.
     *
     * @param authentication 인증 정보 (Spring Security Authentication)
     * @return User 객체 (없으면 null)
     */
    public User getUserFromAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return null;
        return userRepository.findByUsername(authentication.getName());
    }

    /**
     * 사용자 정보를 조회합니다.
     *
     * @param authentication 인증 정보
     * @return 사용자 정보 또는 오류 메시지 ResponseDTO
     */
    public ResponseDTO getUserData(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        if (user == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");

        UserProfile profile  = userProfileRepository.findByUserid(user.getUserid());
        if (profile  == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "프로필 정보가 존재하지 않습니다.");

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

    /**
     * 사용자 정보를 수정합니다.
     *
     * @param authentication 인증 정보
     * @param request 변경 요청 DTO
     * @return 처리 결과 ResponseDTO
     */
    @Transactional
    public ResponseDTO setUserData(Authentication authentication, UserRequestDTO request) {
        User user = getUserFromAuthentication(authentication);
        if (user == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");

        UserProfile profile = userProfileRepository.findByUserid(user.getUserid());
        if (profile == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "프로필 정보가 존재하지 않습니다.");

        String currentEmail = user.getEmail();
        String currentPhone = user.getPhone();
        String currentNickname = profile.getNickname();
        String newEmail = request.getEmail();
        String newPhone = request.getPhone() != null ? request.getPhone().trim() : null;
        String newNickname = request.getNickname();
        List<String> updatedFields = new ArrayList<>();

        // 이메일 변경 처리
        if (newEmail != null && !newEmail.isEmpty() && !newEmail.equals(currentEmail)) {
            if (!userValidationService.isValidEmailFormat(newEmail)) {
                return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "이메일 형식이 올바르지 않습니다.");
            }
            if (userValidationService.isEmailDuplicated(newEmail)) {
                return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 이메일입니다.");
            }
            userRepository.updateEmail(user.getUserid(), newEmail);
            updatedFields.add("이메일");
        }

        // 전화번호 변경 처리
        if (newPhone != null && !newPhone.equals(currentPhone)) {
            if (!newPhone.isEmpty()) {
                if (!userValidationService.isValidPhoneNumberFormat(newPhone)) {
                    return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "전화번호 형식이 올바르지 않습니다.");
                }
                if (userValidationService.isPhoneNumberDuplicated(newPhone)) {
                    return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 전화번호입니다.");
                }
            }
            userRepository.updatePhone(user.getUserid(), newPhone);
            updatedFields.add("전화번호");
        }

        // 닉네임 변경 처리
        if (newNickname != null && !newNickname.isEmpty() && !newNickname.equals(currentNickname)) {
            if (!userValidationService.isValidNicknameFormat(newNickname)) {
                return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "닉네임 형식이 올바르지 않습니다.");
            }
            if (userValidationService.isNicknameDuplicated(newNickname)) {
                return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 사용 중인 닉네임입니다.");
            }
            userProfileRepository.updateNickname(user.getUserid(), newNickname);
            updatedFields.add("닉네임");
        }

        // 변경사항 없으면 패스
        if (updatedFields.isEmpty()) {
            return new ResponseDTO(HttpStatus.OK.value(), "변경된 정보가 없습니다.");
        }

        // 프로필 업데이트 성공 로그
        UserLog userLog = new UserLog();
        userLog.setUserid(user.getUserid().intValue());
        userLog.setActiontype("UPDATE_PROFILE");
        userLog.setStatus(0); // 0: 성공
        userLog.setContent("정보 업데이트: " + String.join(", ", updatedFields));
        userLogService.saveLog(userLog);

        log.info("[알림] 유저 정보 업데이트: {}", user.getUsername());
        return new ResponseDTO(HttpStatus.OK.value(), "사용자 정보가 성공적으로 업데이트되었습니다.");
    }

    /**
     * 프로필 이미지를 변경합니다.
     *
     * @param authentication 인증 정보
     * @param file 업로드할 이미지 파일
     * @return 처리 결과 ResponseDTO
     * @throws IOException 파일 처리 오류
     */
    @Transactional
    public ResponseDTO updateProfileImage(Authentication authentication, MultipartFile file) throws IOException {
        User user = getUserFromAuthentication(authentication);
        if (user == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");

        UserProfile profile = userProfileRepository.findByUserid(user.getUserid());
        if (profile == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "프로필 정보가 존재하지 않습니다.");

        Long fileId = uploadService.uploadAndSaveMetadata(file, authentication);
        profile.setProfileimg(fileId);
        userProfileRepository.save(profile);
        UserLog userLog = new UserLog();
        userLog.setUserid(user.getUserid().intValue());
        userLog.setActiontype("UPDATE_PROFILE_IMAGE");
        userLog.setStatus(0);
        userLog.setContent("프로필 이미지 업데이트");
        userLogService.saveLog(userLog);
        log.info("[알림] 유저 프로필 이미지 업데이트: {} -> 파일 ID {}", user.getUsername(), fileId);
        return new ResponseDTO(HttpStatus.OK.value(), "프로필 이미지가 성공적으로 업데이트되었습니다.");
    }


    public UserProfileUrlResponseDTO getUserProfileURL(String userid) {
        User user = userRepository.findByUseridAndUseyn(Long.valueOf(userid), true);
        if (user == null) {
            return new UserProfileUrlResponseDTO("유저 아이디가 존재하지 않습니다.", "");
        }

        UserProfile profile = userProfileRepository.findByUserid(user.getUserid());
        if (profile == null || profile.getProfileimg() == null) {
            return new UserProfileUrlResponseDTO("유저 프로필 이미지가 존재하지 않습니다.", "");
        }

        Long fileId = profile.getProfileimg();
        String fileName = fileRepository.findStoredFileNameByFileId(fileId);
        return new UserProfileUrlResponseDTO("조회 성공", "http://" + HOST +"/uploads/images/" + fileName);
    }

    /**
     * 사용자 비밀번호를 변경합니다.
     *
     * @param authentication  현재 인증된 사용자 정보
     * @param newPassword     새 비밀번호
     * @return ResponseDTO 처리 결과
     */
    @Transactional
    public ResponseDTO changePassword(Authentication authentication, String newPassword) {
        User user = getUserFromAuthentication(authentication);
        if (user == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");

        if (!userValidationService.isValidPasswordFormat(newPassword)) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "비밀번호 형식이 올바르지 않습니다. 최소 8자, 영문, 숫자, 특수문자를 포함해야 합니다.");
        }
        String encodedPassword = encodePassword(newPassword);
        user.setPassword(encodedPassword);

        // 비밀번호 변경 성공 로그
        UserLog userLog = new UserLog();
        userLog.setUserid(user.getUserid().intValue());
        userLog.setActiontype("CHANGE_PASSWORD");
        userLog.setStatus(0); // 0: 성공
        userLog.setContent("비밀번호 변경");
        userLogService.saveLog(userLog);

        return new ResponseDTO(HttpStatus.OK.value(), "비밀번호가 성공적으로 변경되었습니다.");
    }

    /**
     * 현재 비밀번호가 올바른지 확인합니다.
     *
     * @param authentication  현재 인증된 사용자 정보
     * @param currentPassword 확인할 현재 비밀번호
     * @return ResponseDTO 처리 결과
     */
    @Transactional(readOnly = true)
    public ResponseDTO verifyCurrentPassword(Authentication authentication, String currentPassword) {
        User user = getUserFromAuthentication(authentication);
        if (user == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");

        if(!passwordEncoder.matches(currentPassword, user.getPassword())){
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "비밀번호가 일치하지 않습니다.");
        }
        return new ResponseDTO(HttpStatus.OK.value(), "비밀번호가 일치합니다.");
    }

    /**
     * 회원 탈퇴를 처리합니다.
     *
     * @param authentication  현재 인증된 사용자 정보
     * @param password        확인할 비밀번호
     * @return ResponseDTO 처리 결과
     */
    @Transactional
    public ResponseDTO deleteUser(Authentication authentication, String password) {
        User user = getUserFromAuthentication(authentication);
        if (user == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");

        if(!passwordEncoder.matches(password, user.getPassword())){
            // 탈퇴 실패 로그 기록
            UserLog userLog = new UserLog();
            userLog.setUserid(user.getUserid().intValue());
            userLog.setActiontype("DELETE_USER_FAIL");
            userLog.setStatus(1); // 1: 실패
            userLog.setContent("회원 탈퇴 실패: 비밀번호 불일치");
            userLogService.saveLog(userLog);
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "비밀번호가 일치하지 않습니다.");
        }

        userRepository.updateUseYnByUserId(user.getUserid(), false);

        // 탈퇴 성공 로그 기록
        UserLog userLog = new UserLog();
        userLog.setUserid(user.getUserid().intValue());
        userLog.setActiontype("DELETE_USER");
        userLog.setStatus(0); // 0: 성공
        userLog.setContent("회원 탈퇴 성공");
        userLogService.saveLog(userLog);

        return new ResponseDTO(HttpStatus.OK.value(), "회원 탈퇴가 성공적으로 처리되었습니다.");
    }

    /**
     * 비밀번호를 인코딩합니다.
     *
     * @param password 평문 비밀번호
     * @return 인코딩된 비밀번호
     */
    private String encodePassword(String password) {
        return passwordEncoder.encode(password);
    }
}
