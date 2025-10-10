package com.dakgu.siack.workspace.controller;

import com.dakgu.siack.workspace.dto.ResDTO_UploadWorkspaceImage;
import com.dakgu.siack.utils.ResponseDTO;
import com.dakgu.siack.workspace.dto.ReqDTO_CreateWorkspace;
import com.dakgu.siack.workspace.dto.ResDTO_GetWorkspace;
import com.dakgu.siack.workspace.dto.ReqDTO_ModifyWorkspace;
import com.dakgu.siack.workspace.dto.ReqDTO_InviteWorkspaceMember;
import com.dakgu.siack.workspace.dto.ResDTO_WorkspaceInfo;
import com.dakgu.siack.workspace.service.WorkspaceRequestService;
import com.dakgu.siack.workspace.service.WorkspaceMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/workspace")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceRequestService workspaceRequestService;
    private final WorkspaceMemberService workspaceMemberService; // 멤버 초대/추방 서비스 주입

    @PostMapping("/create")
    public ResponseEntity<?> createWorkspace(Authentication authentication, @RequestBody ReqDTO_CreateWorkspace request) {
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
        List<ResDTO_GetWorkspace> response = workspaceRequestService.getWorkspaceList(authentication);
        return ResponseEntity.status(200).body(response);
    }

    @GetMapping("/{workspaceId}/info")
    public ResponseEntity<?> getWorkspaceInfo(Authentication authentication, @PathVariable("workspaceId") Long workspaceId) {
        ResDTO_WorkspaceInfo dto = workspaceRequestService.getWorkspaceInfo(authentication, workspaceId);
        return ResponseEntity.status(200).body(dto);
    }

    @PatchMapping("/modify")
    public ResponseEntity<?> modifyWorkspace(Authentication authentication, @RequestBody ReqDTO_ModifyWorkspace request) {
        ResponseDTO response = workspaceRequestService.modifyWorkspace(authentication, request);
        return ResponseEntity.status(200).body(response);
    }

    @PostMapping(value = "/{workspaceId}/image", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadWorkspaceImage(
            Authentication authentication,
            @PathVariable("workspaceId") Long workspaceId,
            @RequestPart("file") MultipartFile file
    ) throws java.io.IOException {
        ResDTO_UploadWorkspaceImage response = workspaceRequestService.uploadWorkspaceImage(authentication, file, workspaceId);
        return ResponseEntity.status(200).body(response);
    }

    @PostMapping("/{workspaceId}/members/invite")
    public ResponseEntity<?> inviteMember(Authentication authentication,
                                          @PathVariable("workspaceId") Long workspaceId,
                                          @RequestBody ReqDTO_InviteWorkspaceMember request) {
        ResponseDTO response = workspaceMemberService.inviteMember(authentication, workspaceId, request);
        return ResponseEntity.status(200).body(response);
    }

    @DeleteMapping("/{workspaceId}/members/{userId}")
    public ResponseEntity<?> removeMember(Authentication authentication,
                                          @PathVariable("workspaceId") Long workspaceId,
                                          @PathVariable("userId") Long userId) {
        ResponseDTO response = workspaceMemberService.removeMember(authentication, workspaceId, userId);
        return ResponseEntity.status(200).body(response);
    }
}
