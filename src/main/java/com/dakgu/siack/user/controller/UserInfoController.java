package com.dakgu.siack.user.controller;

import com.dakgu.siack.user.dto.UserRequestDTO;
import com.dakgu.siack.user.service.UserService;
import com.dakgu.siack.utils.ResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/userinfo")
@RequiredArgsConstructor
public class UserInfoController {

    private final UserService userService;

    @GetMapping("")
    public ResponseEntity<?> getMyInfo(Authentication authentication) {
        ResponseDTO response = userService.getUserData(authentication);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/modify")
    public ResponseEntity<?> setMyInfo(Authentication authentication, @RequestBody UserRequestDTO userRequestDTO) {
        ResponseDTO response = userService.setUserData(authentication, userRequestDTO);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

}
