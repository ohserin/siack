package com.dakgu.siack.log.controller;

import com.dakgu.siack.log.service.UserLogService;
import com.dakgu.siack.log.vo.UserLog;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.dakgu.siack.log.dto.PageResponse;

import java.util.ArrayList;

@RestController
@RequestMapping("/v1/logs")
@RequiredArgsConstructor
public class UserLogController {

    private final UserLogService userLogService;
    private final UserRepository userRepository;

    @GetMapping("/user")
    public PageResponse<UserLog> getUserLogs(
            Authentication authentication,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        if (authentication == null) return new PageResponse<>();

        String username = authentication.getName();
        User user = userRepository.findByUsername(username);
        if (user == null) return new PageResponse<>();

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdat").descending());

        return userLogService.getLogsByUserId(user.getUserid().intValue(), pageable);
    }

}
