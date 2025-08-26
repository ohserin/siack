package com.dakgu.siack.user.controller;

import com.dakgu.siack.user.dto.UserRequestDTO;
import com.dakgu.siack.user.service.UserService;
import com.dakgu.siack.utils.ResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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

    @PostMapping(value = "/modify-profile", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> updateProfileImage(Authentication authentication, @RequestPart("file") MultipartFile file) throws IOException {
        ResponseDTO response = userService.updateProfileImage(authentication, file);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

}
