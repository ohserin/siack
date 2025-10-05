package com.dakgu.siack.workspace.service;

import com.dakgu.siack.file.service.FileUploadService;
import com.dakgu.siack.user.service.UserService;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.user.vo.UserProfile;
import com.dakgu.siack.utils.ResponseDTO;
import com.dakgu.siack.workspace.dto.*;
import com.dakgu.siack.workspace.repository.ChannelMemberRepository;
import com.dakgu.siack.workspace.repository.ChannelRepository;
import com.dakgu.siack.workspace.repository.WorkspaceMemberRepository;
import com.dakgu.siack.workspace.repository.WorkspaceRepository;
import com.dakgu.siack.workspace.vo.ChannelMemberVO;
import com.dakgu.siack.workspace.vo.ChannelVO;
import com.dakgu.siack.workspace.vo.WorkspaceMemberVO;
import com.dakgu.siack.workspace.vo.WorkspaceVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class WorkspaceRequestService {
    private final WorkspaceRepository workspaceRepository;
    private final UserService userService;
    private final ChannelRepository channelRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final FileUploadService uploadService;

    /**
     * 워크스페이스를 생성합니다. (기본 채널 및 OWNER 멤버 자동 생성)
     * @param authentication 인증 정보
     * @param request 워크스페이스 생성 요청 DTO
     * @return 생성 결과 ResponseDTO (201: 성공, 404: 사용자 없음)
     */
    @Transactional
    public ResponseDTO createWorkspace(Authentication authentication, ReqDTO_CreateWorkspace request) {
        User user = getAuthenticatedUser(authentication);
        WorkspaceVO workspace = WorkspaceVO.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(user)
                .status(true)
                .build();
        workspaceRepository.save(workspace);

        WorkspaceMemberVO workspaceMember = WorkspaceMemberVO.builder()
                .workspace(workspace)
                .user(user)
                .role("OWNER")
                .status(true)
                .build();
        workspaceMemberRepository.save(workspaceMember);

        ChannelVO defaultChannel = ChannelVO.builder()
                .workspace(workspace)
                .name("일반")
                .description("워크스페이스 채널")
                .isPrivate(false)
                .status(true)
                .build();
        channelRepository.save(defaultChannel);

        ChannelMemberVO member = ChannelMemberVO.builder()
                .channel(defaultChannel)
                .user(user)
                .role("ADMIN")
                .status(true)
                .build();
        channelMemberRepository.save(member);

        return new ResponseDTO(HttpStatus.CREATED.value(), "워크스페이스가 생성되었습니다.");
    }

    /**
     * 워크스페이스를 비활성화(삭제)합니다. (소유자만 가능)
     * @param authentication 인증 정보
     * @param workspaceId 비활성화할 워크스페이스 ID
     * @return 삭제 결과 ResponseDTO (200: 성공, 403: 권한없음, 404: 없음)
     */
    @Transactional
    public ResponseDTO deleteWorkspace(Authentication authentication, Long workspaceId) {
        User user = getAuthenticatedUser(authentication);
        WorkspaceVO workspace = getWorkspaceOrThrow(workspaceId);
        validateOwner(user, workspace);
        workspace.setStatus(false);
        workspaceRepository.save(workspace);
        return new ResponseDTO(HttpStatus.OK.value(), "워크스페이스가 삭제(비활성화)되었습니다.");
    }

    /**
     * 사용자가 속한 모든 활성 워크스페이스 목록을 조회합니다.
     * @param authentication 인증 정보
     * @return 워크스페이스 목록 (GetWorkspaceResponseDTO 리스트)
     */
    @Transactional(readOnly = true)
    public List<ResDTO_GetWorkspace> getWorkspaceList(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<WorkspaceMemberVO> myMemberships = workspaceMemberRepository.findByUser_Userid(user.getUserid());
        Set<Long> workspaceIdSet = new HashSet<>();
        List<ResDTO_GetWorkspace> workspaceList = new ArrayList<>();

        for (WorkspaceMemberVO membership : myMemberships) {
            WorkspaceVO workspace = membership.getWorkspace();
            if (workspace == null || !workspace.isStatus() || !workspaceIdSet.add(workspace.getWorkspaceId())) continue;
            Long ownerId = Optional.ofNullable(workspace.getOwner()).map(User::getUserid).orElse(null);
            List<ResDTO_WorkspaceUser> userDTOList = getWorkspaceUserDTOList(workspace.getWorkspaceId());
            workspaceList.add(ResDTO_GetWorkspace.builder()
                    .workspaceId(workspace.getWorkspaceId())
                    .name(workspace.getName())
                    .description(workspace.getDescription())
                    .ownerId(ownerId)
                    .users(userDTOList)
                    .build());
        }
        return workspaceList;
    }

    /**
     * 워크스페이스 정보를 수정합니다. (소유자만 가능, null이 아닌 값만 반영)
     * @param authentication 인증 정보
     * @param request 수정 요청 DTO
     * @return 수정 결과 ResponseDTO (200: 성공, 403: 권한없음, 404: 없음)
     */
    @Transactional
    public ResponseDTO modifyWorkspace(Authentication authentication, ReqDTO_ModifyWorkspace request) {
        User user = getAuthenticatedUser(authentication);
        WorkspaceVO workspace = getWorkspaceOrThrow(request.getWorkspaceId());
        validateOwner(user, workspace);
        boolean changed = false;
        if (request.getName() != null && !request.getName().equals(workspace.getName())) {
            workspace.setName(request.getName());
            changed = true;
        }
        if (request.getDescription() != null && !request.getDescription().equals(workspace.getDescription())) {
            workspace.setDescription(request.getDescription());
            changed = true;
        }
        if (changed) {
            workspaceRepository.save(workspace);
        }
        return new ResponseDTO(HttpStatus.OK.value(), "워크스페이스 정보가 수정되었습니다.");
    }

    @Transactional
    public ResponseDTO uploadWorkspaceImage(Authentication authentication, MultipartFile file, Long workspaceId) throws IOException {
        getAuthenticatedUser(authentication);
        WorkspaceVO workspace = getWorkspaceOrThrow(workspaceId);

        if (!isAllowedImageExtension(file)) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "이미지 파일(jpg, jpeg, png)만 업로드 가능합니다.");
        }

        Long fileId = uploadService.uploadAndSaveMetadata(file, authentication);
        workspace.setImageId(fileId);
        workspaceRepository.save(workspace);

        return new ResponseDTO(HttpStatus.OK.value(), "워크스페이스 이미지 업데이트되었습니다.");
    }

    // === Private Helper Methods ===

    /**
     * 이미지 파일 확장자(jpg, jpeg, png)만 허용하는 검증 메서드
     */
    private static boolean isAllowedImageExtension(MultipartFile file) {
        String extension = org.springframework.util.StringUtils.getFilenameExtension(file.getOriginalFilename());
        Set<String> allowedExtensions = Set.of("jpg", "jpeg", "png");
        return extension != null && allowedExtensions.contains(extension.toLowerCase());
    }

    /**
     * 인증 정보에서 사용자 엔티티를 조회합니다. (없으면 예외)
     * @param authentication 인증 정보
     * @return User 엔티티
     * @throws IllegalArgumentException 사용자 정보 없음
     */
    private User getAuthenticatedUser(Authentication authentication) {
        return Optional.ofNullable(userService.getUserFromAuthentication(authentication))
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));
    }

    /**
     * 워크스페이스 ID로 워크스페이스 엔티티를 조회합니다. (없으면 예외)
     * @param workspaceId 워크스페이스 ID
     * @return WorkspaceVO 엔티티
     * @throws IllegalArgumentException 워크스페이스 없음
     */
    private WorkspaceVO getWorkspaceOrThrow(Long workspaceId) {
        if (workspaceId == null) throw new IllegalArgumentException("워크스페이스 ID가 필요합니다.");
        WorkspaceVO workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));
        if (!workspace.isStatus()) {
            throw new IllegalArgumentException("삭제된 워크스페이스입니다.");
        }
        return workspace;
    }

    /**
     * 워크스페이스 소유자인지 검증합니다. (아니면 예외)
     * @param user 사용자
     * @param workspace 워크스페이스
     * @throws SecurityException 소유자 아님
     */
    private void validateOwner(User user, WorkspaceVO workspace) {
        if (!workspace.getOwner().getUserid().equals(user.getUserid())) {
            throw new SecurityException("워크스페이스 소유자만 작업할 수 있습니다.");
        }
    }

    /**
     * 워크스페이스의 모든 활성 멤버를 WorkspaceUserDTO 리스트로 반환합니다.
     * @param workspaceId 워크스페이스 ID
     * @return WorkspaceUserDTO 리스트
     */
    private List<ResDTO_WorkspaceUser> getWorkspaceUserDTOList(Long workspaceId) {
        List<WorkspaceMemberVO> members = workspaceMemberRepository.findByWorkspace_WorkspaceId(workspaceId);
        List<ResDTO_WorkspaceUser> userDTOList = new ArrayList<>();
        for (WorkspaceMemberVO member : members) {
            User memberUser = member.getUser();
            if (memberUser == null || !memberUser.isUseyn()) continue;
            String nickname = Optional.ofNullable(memberUser.getUserProfile())
                    .map(UserProfile::getNickname)
                    .orElse(memberUser.getUsername());
            Long profileImage = Optional.ofNullable(memberUser.getUserProfile())
                    .map(UserProfile::getProfileimg)
                    .orElse(null);
            userDTOList.add(ResDTO_WorkspaceUser.builder()
                    .id(String.valueOf(memberUser.getUserid()))
                    .nickname(nickname)
                    .profileImage(profileImage)
                    .build());
        }
        return userDTOList;
    }
}
