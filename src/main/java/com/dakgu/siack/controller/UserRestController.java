package com.dakgu.siack.controller;

import com.dakgu.siack.user.domain.UserRequestDTO;
import com.dakgu.siack.user.service.UserService;
import com.dakgu.siack.util.ResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RequestMapping("/v1/user")
@RestController
public class UserRestController {

    private final UserService userService;

    /* 유저네임 중복 여부를 확인 */
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsernameDuplication(@RequestParam("username") String username) {
        ResponseDTO response = userService.checkUsernameAvailability(username);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /* 이메일 중복 여부를 확인 */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailDuplication(@RequestParam("email") String email) {
        ResponseDTO response = userService.checkEmailAvailability(email);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /* 전화번호 중복 여부를 확인 */
    @GetMapping("/check-phone")
    public ResponseEntity<?> checkPhoneDuplication(@RequestParam("phone") String phone) {
        ResponseDTO response = userService.checkPhoneAvailability(phone);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /* 닉네임 중복 여부를 확인 */
    @GetMapping("/check-nickname")
    public ResponseEntity<?> checkNicknameDuplication(@RequestParam("nickname") String nickname) {
        ResponseDTO response = userService.checkNicknameAvailability(nickname);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /* 사용자 회원가입 */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRequestDTO request) {
        ResponseDTO response = userService.registerUser(request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /* 사용자 로그인 */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserRequestDTO request) {
        ResponseDTO response = userService.loginUser(request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

}
