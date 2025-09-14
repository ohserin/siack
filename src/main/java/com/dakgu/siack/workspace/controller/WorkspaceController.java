package com.dakgu.siack.workspace.controller;

import com.dakgu.siack.utils.ResponseDTO;
import com.dakgu.siack.workspace.dto.CreateWorkspaceRequestDTO;
import com.dakgu.siack.workspace.dto.GetWorkspaceResponseDTO;
import com.dakgu.siack.workspace.service.WorkspaceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/workspace")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceRequestService workspaceRequestService;

    @PostMapping("/create")
    public ResponseEntity<?> createWorkspace(Authentication authentication, @RequestBody CreateWorkspaceRequestDTO request) {
        ResponseDTO response = workspaceRequestService.createWorkspace(authentication, request);
        return ResponseEntity.status(200).body(response);
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<?> deleteWorkspace(Authentication authentication, @PathVariable("workspaceId") Long workspaceId) {
        ResponseDTO response = workspaceRequestService.deleteWorkspace(authentication, workspaceId);
        return ResponseEntity.status(200).body(response);
    }

    @GetMapping("/list")
    public ResponseEntity<?> getWorkspaceList(Authentication authentication) {
        List<GetWorkspaceResponseDTO> response = workspaceRequestService.getWorkspaceList(authentication);
        return ResponseEntity.status(200).body(response);
    }


}
