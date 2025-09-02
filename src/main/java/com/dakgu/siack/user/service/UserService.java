package com.dakgu.siack.user.service;

import com.dakgu.siack.config.jwt.JwtTokenProvider;
import com.dakgu.siack.file.repository.SdfFileRepository;
import com.dakgu.siack.file.service.FileService;
import com.dakgu.siack.file.service.FileUploadService;
import com.dakgu.siack.log.service.UserLogService;
import com.dakgu.siack.log.vo.UserLog;
import com.dakgu.siack.user.dto.UserRequestDTO;
import com.dakgu.siack.user.dto.UserResponseDTO;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.user.vo.UserProfile;
import com.dakgu.siack.user.repository.UserProfileRepository;
import com.dakgu.siack.user.repository.UserRepository;
import com.dakgu.siack.utils.ResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
        // 1. UsernamePasswordAuthenticationToken 생성
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());

        // 2. 실제 인증 (사용자 비밀번호 검증)
        Authentication authentication;
        try {
            authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        } catch (UsernameNotFoundException e) {
            UserLog userLog = new UserLog();
            userLog.setUserid(0); // 사용자를 특정할 수 없으므로 0으로 설정
            userLog.setActiontype("LOGIN_FAIL");
            userLog.setStatus(1); // 1: 실패
            userLog.setContent("로그인 실패: 존재하지 않는 사용자 '" + request.getUsername() + "'");
            userLogService.saveLog(userLog);
            return new UserResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자를 찾을 수 없습니다.", null, null, null);
        } catch (BadCredentialsException e) {
            User user = userRepository.findByUsername(request.getUsername());
            if (user != null) {
                UserLog userLog = new UserLog();
                userLog.setUserid(user.getUserid().intValue());
                userLog.setActiontype("LOGIN_FAIL");
                userLog.setStatus(1); // 1: 실패
                userLog.setContent("로그인 실패");
                userLogService.saveLog(userLog);
            }
            return new UserResponseDTO(HttpStatus.UNAUTHORIZED.value(), "비밀번호가 일치하지 않습니다.", null, null, null);
        }

        // 3. 인증 정보를 기반으로 JWT 토큰 생성
        String jwt = jwtTokenProvider.generateToken(authentication);

        // 사용자 정보 가져오기
        User user = userRepository.findByUsername(request.getUsername());
        String nickname = (user != null && user.getUserProfile() != null) ? user.getUserProfile().getNickname() : null;
        assert user != null;

        // 로그인 성공 로그
        UserLog userLog = new UserLog();
        userLog.setUserid(user.getUserid().intValue());
        userLog.setActiontype("LOGIN");
        userLog.setStatus(0); // 0: 성공
        userLog.setContent("로그인 성공");
        userLogService.saveLog(userLog);

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

    @Transactional
    public ResponseDTO updateProfileImage(Authentication authentication, MultipartFile file) throws IOException {
        // 1. 로그인된 사용자 식별
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

        // 2. 파일 업로드 및 메타데이터 저장
        Long fileId = uploadService.uploadAndSaveMetadata(file, authentication);

        // 3. UserProfile의 profileimg 필드 업데이트
        profile.setProfileimg(fileId);
        userProfileRepository.save(profile); // 변경된 UserProfile 저장

        // 프로필 이미지 업데이트 성공 로그
        UserLog userLog = new UserLog();
        userLog.setUserid(user.getUserid().intValue());
        userLog.setActiontype("UPDATE_PROFILE_IMAGE");
        userLog.setStatus(0); // 0: 성공
        userLog.setContent("프로필 이미지 업데이트");
        userLogService.saveLog(userLog);

        log.info("[알림] 유저 프로필 이미지 업데이트: {} -> 파일 ID {}", user.getUsername(), fileId);
        return new ResponseDTO(HttpStatus.OK.value(), "프로필 이미지가 성공적으로 업데이트되었습니다.");
    }

    public ResponseEntity<byte[]> getUserProfileImage(String userid) {
        User user = userRepository.findByUserid(Long.valueOf(userid));
        if (user == null) return null;
        UserProfile profile = userProfileRepository.findByUserid(user.getUserid());
        if (profile == null || profile.getProfileimg() == null) return null;

        Long fileId = profile.getProfileimg();
        String path = fileRepository.findPathByFileId(fileId);

        if (path == null || path.isEmpty()) return null;

        String extension = "";
        int i = path.lastIndexOf('.');
        if (i > 0) {
            extension = path.substring(i + 1);
        }
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (extension.equalsIgnoreCase("png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (extension.equalsIgnoreCase("jpg") || extension.equalsIgnoreCase("jpeg")) {
            mediaType = MediaType.IMAGE_JPEG;
        } else if (extension.equalsIgnoreCase("gif")) {
            mediaType = MediaType.IMAGE_GIF;
        }

        byte[] bytes = fileService.readFile(path);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(bytes);
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
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");
        }

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
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");
        }

        if(!passwordEncoder.matches(currentPassword, user.getPassword())){
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "비밀번호가 일치하지 않습니다.");
        }

        return new ResponseDTO(HttpStatus.OK.value(), "비밀번호가 일치합니다.");
    }

    private String encodePassword(String password) {
        return passwordEncoder.encode(password);
    }
}
