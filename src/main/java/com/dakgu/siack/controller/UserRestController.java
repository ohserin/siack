package com.dakgu.siack.controller;

import com.dakgu.siack.user.service.UserService;
import com.dakgu.siack.util.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/user")
@RestController
public class UserRestController {

    private final UserService userService;

    /**
     * 사용자 이름(ID)의 중복 여부를 확인하는 API 엔드포인트입니다.
     * 클라이언트로부터 `username`을 쿼리 파라미터로 받아 해당 이름이 이미 존재하는지 확인합니다.
     * @param username 중복 확인을 요청하는 사용자 이름
     * @return 중복 여부에 따른 응답.
     * - 사용자 이름이 사용 가능하면 HTTP 200 OK와 함께 성공 메시지.
     * - 사용자 이름이 이미 존재하면 HTTP 409 CONFLICT와 함께 중복 메시지.
     */
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsernameDuplication(@RequestParam("username") String username) {
        boolean exists = userService.checkUsernameDuplication(username);

        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 사용자 이름입니다."));
        } else {
            return ResponseEntity.ok(new ResponseDto(HttpStatus.OK.value(), "사용 가능한 사용자 이름입니다."));
        }
    }

    /**
     * 이메일 중복 여부를 확인하는 API 엔드포인트.
     * @param email 중복 확인을 요청하는 이메일 주소
     * @return 중복 여부에 따른 응답.
     * - 이메일이 사용 가능하면 HTTP 200 OK.
     * - 이메일이 이미 존재하면 HTTP 409 CONFLICT.
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailDuplication(@RequestParam("email") String email) {
        if (userService.checkEmailDuplication(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 이메일입니다."));
        }
        return ResponseEntity.ok(new ResponseDto(HttpStatus.OK.value(), "사용 가능한 이메일입니다."));
    }
}
