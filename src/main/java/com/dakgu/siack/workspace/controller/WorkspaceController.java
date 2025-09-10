package com.dakgu.siack.workspace.controller;

import com.dakgu.siack.utils.ResponseDTO;
import com.dakgu.siack.workspace.dto.WorkspaceRequestDTO;
import com.dakgu.siack.workspace.service.WorkspaceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/workspace")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceRequestService workspaceRequestService;

    @PostMapping("/create")
    public ResponseEntity<?> createWorkspace(Authentication authentication, @RequestBody WorkspaceRequestDTO request) {
        ResponseDTO response = workspaceRequestService.createWorkspace(authentication, request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }


}
