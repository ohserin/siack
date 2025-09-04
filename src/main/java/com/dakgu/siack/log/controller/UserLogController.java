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

@RestController
@RequestMapping("/v1/logs")
@RequiredArgsConstructor
public class UserLogController {

    private final UserLogService userLogService;
    private final UserRepository userRepository;

    class PageResponse<T> {
        private final java.util.List<T> content;
        private final int page;
        private final int size;
        private final long totalElements;
        private final int totalPages;
        public PageResponse(Page<T> page) {
            this.content = page.getContent();
            this.page = page.getNumber();
            this.size = page.getSize();
            this.totalElements = page.getTotalElements();
            this.totalPages = page.getTotalPages();
        }
        public java.util.List<T> getContent() { return content; }
        public int getPage() { return page; }
        public int getSize() { return size; }
        public long getTotalElements() { return totalElements; }
        public int getTotalPages() { return totalPages; }
    }

    @GetMapping("/user")
    public ResponseEntity<PageResponse<UserLog>> getUserLogs(
            Authentication authentication,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        if (authentication == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdat").descending());
        Page<UserLog> logs = userLogService.getLogsByUserId(user.getUserid().intValue(), pageable);

        return ResponseEntity.ok(new PageResponse<>(logs));
    }

}
