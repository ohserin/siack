package com.dakgu.siack.workspace.service;

import com.dakgu.siack.user.repository.UserProfileRepository;
import com.dakgu.siack.user.service.UserService;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.user.vo.UserProfile;
import com.dakgu.siack.utils.ResponseDTO;
import com.dakgu.siack.workspace.dto.ReqDTO_InviteWorkspaceMember;
import com.dakgu.siack.workspace.repository.WorkspaceMemberRepository;
import com.dakgu.siack.workspace.repository.WorkspaceRepository;
import com.dakgu.siack.workspace.domain.WorkspaceMember;
import com.dakgu.siack.workspace.domain.Workspace;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceMemberService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserService userService;

    private static final Set<String> ALLOWED_ROLES = Set.of("MEMBER", "ADMIN");

    /**
     * 워크스페이스에 속한 모든 유저가 멤버를 초대할 수 있습니다. (닉네임 기반, 활성 사용자만)
     */
    @Transactional
    public ResponseDTO inviteMember(Authentication authentication, Long workspaceId, ReqDTO_InviteWorkspaceMember request) {
        User operator = getAuthUser(authentication);
        if (workspaceId == null) return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "워크스페이스 ID가 필요합니다.");
        if (request == null || request.getNickname() == null || request.getNickname().trim().isEmpty()) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "초대할 사용자 닉네임이 필요합니다.");
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));
        if (!workspace.isStatus()) return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "삭제된 워크스페이스입니다.");

        String nickname = request.getNickname().trim();
        // 활성 사용자(useyn=true)만 조회
        UserProfile profile = userProfileRepository.findByNicknameAndUser_Useyn(nickname, true);
        if (profile == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "닉네임을 찾을 수 없습니다.");
        }
        User target = profile.getUser();
        if (target == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보가 올바르지 않습니다.");
        }
        if (target.getUserid().equals(workspace.getOwner().getUserid())) {
            return new ResponseDTO(HttpStatus.CONFLICT.value(), "소유자는 이미 멤버입니다.");
        }

        Optional<WorkspaceMember> existingOpt = workspaceMemberRepository.findByWorkspace_WorkspaceIdAndUser_Userid(workspaceId, target.getUserid());
        if (existingOpt.isPresent()) {
            WorkspaceMember existing = existingOpt.get();
            if (existing.isStatus()) {
                return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 멤버로 존재합니다.");
            } else {
                existing.setStatus(true);
                existing.setRole(resolveRole(request.getRole()));
                workspaceMemberRepository.save(existing);
                return new ResponseDTO(HttpStatus.CREATED.value(), "비활성 멤버를 재초대했습니다.");
            }
        }

        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(workspace)
                .user(target)
                .role(resolveRole(request.getRole()))
                .status(true)
                .build();
        workspaceMemberRepository.save(member);

        return new ResponseDTO(HttpStatus.CREATED.value(), "멤버가 초대되었습니다.");
    }

    /**
     * 워크스페이스 운영자(OWNER)가 특정 멤버를 추방(비활성화)합니다.
     */
    @Transactional
    public ResponseDTO removeMember(Authentication authentication, Long workspaceId, Long targetUserId) {
        User operator = getAuthUser(authentication);
        if (workspaceId == null || targetUserId == null) return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "워크스페이스 ID와 사용자 ID가 필요합니다.");

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));
        if (!workspace.isStatus()) return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "삭제된 워크스페이스입니다.");
        validateOwner(operator, workspace);

        if (workspace.getOwner().getUserid().equals(targetUserId)) {
            return new ResponseDTO(HttpStatus.FORBIDDEN.value(), "소유자는 추방할 수 없습니다.");
        }

        WorkspaceMember membership = workspaceMemberRepository
                .findByWorkspace_WorkspaceIdAndUser_Userid(workspaceId, targetUserId)
                .orElse(null);
        if (membership == null || !membership.isStatus()) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "활성 멤버가 아닙니다.");
        }

        membership.setStatus(false);
        workspaceMemberRepository.save(membership);
        return new ResponseDTO(HttpStatus.OK.value(), "멤버를 추방했습니다.");
    }

    private String resolveRole(String role) {
        if (role == null) return "MEMBER";
        String upper = role.trim().toUpperCase();
        return ALLOWED_ROLES.contains(upper) ? upper : "MEMBER";
    }

    private User getAuthUser(Authentication authentication) {
        return Optional.ofNullable(userService.getUserFromAuthentication(authentication))
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));
    }

    private void validateOwner(User operator, Workspace workspace) {
        if (!workspace.getOwner().getUserid().equals(operator.getUserid())) {
            throw new SecurityException("워크스페이스 소유자만 작업할 수 있습니다.");
        }
    }
}
