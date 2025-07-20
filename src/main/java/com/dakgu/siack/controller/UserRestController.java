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

    /* 유저네임 중복 여부를 확인하는 API 엔드포인트 */
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsernameDuplication(@RequestParam("username") String username) {

        if (!userService.isValidUsernameFormat(username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDto(HttpStatus.BAD_REQUEST.value(), "사용자 이름 형식이 올바르지 않습니다."));
        }

        if (userService.isUsernameDuplicated(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 사용자 이름입니다."));
        }

        return ResponseEntity.ok(new ResponseDto(HttpStatus.OK.value(), "사용 가능한 사용자 이름입니다."));
    }

    /* 이메일 중복 여부를 확인하는 API 엔드포인트 */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailDuplication(@RequestParam("email") String email) {

        if (!userService.isValidEmailFormat(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDto(HttpStatus.BAD_REQUEST.value(), "이메일 형식이 올바르지 않습니다."));
        }

        if (userService.isEmailDuplicated(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ResponseDto(HttpStatus.CONFLICT.value(), "이미 사용 중인 이메일입니다."));
        }

        return ResponseEntity.ok(new ResponseDto(HttpStatus.OK.value(), "사용 가능한 이메일입니다."));
    }
}
