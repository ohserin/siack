package com.dakgu.siack.controller;

import com.dakgu.siack.user.service.UserService;
import com.dakgu.siack.util.ResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/userinfo")
@RequiredArgsConstructor
public class UserInfoController {

    private final UserService userService;

    @GetMapping("/")
    public ResponseEntity<?> getMyInfo(Authentication authentication) {
        ResponseDTO response = userService.getUserData(authentication);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

}
