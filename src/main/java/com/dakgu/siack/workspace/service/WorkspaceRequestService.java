package com.dakgu.siack.workspace.service;

import com.dakgu.siack.workspace.dto.ResDTO_UploadWorkspaceImage;
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
import com.dakgu.siack.file.dto.FileStorageResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
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
        String inviteCode = getUniqueInviteCode();
        WorkspaceVO workspace = WorkspaceVO.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(user)
                .status(true)
                .inviteCode(inviteCode)
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
                    .workspaceImage(workspace.getImageUrl())
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
        if (request.getWorkspaceName() != null && !request.getWorkspaceName().equals(workspace.getName())) {
            workspace.setName(request.getWorkspaceName());
            changed = true;
        }
        if (request.getWorkspaceDesc() != null && !request.getWorkspaceDesc().equals(workspace.getDescription())) {
            workspace.setDescription(request.getWorkspaceDesc());
            changed = true;
        }
        if (changed) {
            workspaceRepository.save(workspace);
        }
        return new ResponseDTO(HttpStatus.OK.value(), "워크스페이스 정보가 수정되었습니다.");
    }

    /**
     * 워크스페이스의 이미지를 업로드하고, 업로드된 이미지의 URL을 워크스페이스에 저장합니다.
     * 처리 과정:
     *   인증된 사용자인지 확인
     *   워크스페이스 존재 및 권한 확인
     *   파일 확장자(jpg, jpeg, png) 유효성 검사
     *   파일 업로드 및 저장 경로 획득
     *   업로드된 파일 경로로부터 imageUrl 추출
     *   워크스페이스 엔티티에 imageUrl 저장
     *   업로드 결과 DTO 반환
     * @param authentication 인증 정보
     * @param file 업로드할 이미지 파일 (jpg, jpeg, png)
     * @param workspaceId 이미지 변경 대상 워크스페이스 ID
     * @return 업로드 결과(상태, 메시지, imageUrl)
     * @throws IOException 파일 업로드 실패 시
     */
    @Transactional
    public ResDTO_UploadWorkspaceImage uploadWorkspaceImage(Authentication authentication, MultipartFile file, Long workspaceId) throws IOException {
        getAuthenticatedUser(authentication);
        WorkspaceVO workspace = getWorkspaceOrThrow(workspaceId);

        if (!isAllowedImageExtension(file)) {
            return new ResDTO_UploadWorkspaceImage(HttpStatus.BAD_REQUEST.value(), "이미지 파일(jpg, jpeg, png)만 업로드 가능합니다.", null);
        }

        FileStorageResult fileStorageResult = uploadService.uploadAndReturnStorageResult(file, authentication);
        String imageUrl = extractImageUrl(fileStorageResult);

        workspace.setImageUrl(imageUrl);
        workspaceRepository.save(workspace);

        return new ResDTO_UploadWorkspaceImage(200, "워크스페이스 이미지 업데이트되었습니다.", imageUrl);
    }

    /**
     * 단일 워크스페이스 상세 정보를 조회합니다.
     * 멤버만 조회 가능하며, 활성 워크스페이스만 반환합니다.
     * 반환 객체의 statusCode/message 에 결과 코드를 담습니다.
     */
    @Transactional(readOnly = true)
    public ResDTO_WorkspaceInfo getWorkspaceInfo(Authentication authentication, Long workspaceId) {
        User user = userService.getUserFromAuthentication(authentication);
        if (workspaceId == null) {
            ResDTO_WorkspaceInfo dto = new ResDTO_WorkspaceInfo();
            dto.setStatusCode(HttpStatus.BAD_REQUEST.value());
            dto.setMessage("워크스페이스 ID가 필요합니다.");
            return dto;
        }

        Optional<WorkspaceVO> opt = workspaceRepository.findById(workspaceId);
        if (opt.isEmpty()) {
            ResDTO_WorkspaceInfo dto = new ResDTO_WorkspaceInfo();
            dto.setStatusCode(HttpStatus.NOT_FOUND.value());
            dto.setMessage("워크스페이스를 찾을 수 없습니다.");
            return dto;
        }
        WorkspaceVO workspace = opt.get();
        if (!workspace.isStatus()) {
            ResDTO_WorkspaceInfo dto = new ResDTO_WorkspaceInfo();
            dto.setStatusCode(HttpStatus.BAD_REQUEST.value());
            dto.setMessage("삭제된 워크스페이스입니다.");
            return dto;
        }

        // 멤버십 확인 및 사용자 역할 조회
        Optional<WorkspaceMemberVO> membershipOpt = (user != null) ? workspaceMemberRepository
                .findByWorkspace_WorkspaceIdAndUser_Userid(workspaceId, user.getUserid())
                .filter(WorkspaceMemberVO::isStatus) : Optional.empty();

        if (membershipOpt.isEmpty()) {
            ResDTO_WorkspaceInfo dto = new ResDTO_WorkspaceInfo();
            dto.setStatusCode(HttpStatus.FORBIDDEN.value());
            dto.setMessage("워크스페이스 멤버만 조회할 수 있습니다.");
            return dto;
        }

        // 현재 사용자의 워크스페이스 역할 가져오기
        String userRole = membershipOpt.get().getRole();

        // 소유자 이름: 프로필 닉네임 우선, 없으면 username
        String ownerName = Optional.ofNullable(workspace.getOwner())
                .map(o -> {
                    UserProfile p = o.getUserProfile();
                    return (p != null && p.getNickname() != null && !p.getNickname().isBlank())
                            ? p.getNickname() : o.getUsername();
                })
                .orElse(null);

        // 생성일 포맷팅
        String createdAtStr = null;
        if (workspace.getCreatedat() != null) {
            createdAtStr = workspace.getCreatedat().toLocalDateTime()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        }

        List<ResDTO_WorkspaceUser> userDTOList = getWorkspaceUserDTOList(workspaceId);
        int memberCount = userDTOList.size();
        long channelCount = channelRepository.countByWorkspace_WorkspaceIdAndStatusTrue(workspaceId);

        ResDTO_WorkspaceInfo dto = ResDTO_WorkspaceInfo.builder()
                .workspaceId(workspace.getWorkspaceId())
                .workspaceName(workspace.getName())
                .workspaceDesc(workspace.getDescription())
                .createDate(createdAtStr)
                .workspaceImage(workspace.getImageUrl())
                .ownerName(ownerName)
                .userRole(userRole)
                .planName("Free")
                .usedStorage(0.0)
                .memberCount(memberCount)
                .channelCount((int) channelCount)
                .inviteCode(workspace.getInviteCode())
                .users(userDTOList)
                .build();
        dto.setStatusCode(HttpStatus.OK.value());
        dto.setMessage("워크스페이스 정보");
        return dto;
    }

    /**
     * 초대코드로 워크스페이스에 참여합니다.
     * @param authentication 인증 정보
     * @param request 참여 요청 DTO (code)
     * @return 참여 결과 ResponseDTO
     */
    @Transactional
    public ResponseDTO joinWorkspace(Authentication authentication, ReqDTO_JoinWorkspace request) {
        User user = getAuthenticatedUser(authentication);
        String code = request.getCode();
        // 워크스페이스 코드로 조회
        WorkspaceVO workspace = workspaceRepository.findByInviteCode(code);
        if (workspace == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(),"유효하지 않은 초대코드입니다.");
        }
        // 이미 멤버인지 확인
        boolean isMember = workspaceMemberRepository.existsByWorkspace_WorkspaceIdAndUser_Userid(workspace.getWorkspaceId(), user.getUserid());
        if (isMember) {
            return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 참여한 워크스페이스입니다.");
        }
        // 멤버로 추가
        WorkspaceMemberVO member = new WorkspaceMemberVO();
        member.setWorkspace(workspace);
        member.setUser(user);
        member.setRole("MEMBER");
        workspaceMemberRepository.save(member);
        return new ResponseDTO(HttpStatus.OK.value(), "워크스페이스에 참여했습니다.");
    }

    // === Private Helper Methods ===

    /**
     * 중복 없는 초대코드 생성 메서드
     * */
    private String getUniqueInviteCode() {
        String code;
        do {
            code = com.dakgu.siack.workspace.util.InviteCodeUtil.generateInviteCode();
        } while (workspaceRepository.existsByInviteCode(code));
        return code;
    }

    /**
     * 파일 저장 결과에서 imageUrl을 추출합니다.
     */
    private String extractImageUrl(FileStorageResult fileStorageResult) {
        String fullPath = fileStorageResult != null ? fileStorageResult.getFullPath() : null;
        if (fullPath == null || fullPath.isBlank()) return null;
        String normalized = fullPath.replace("\\", "/");
        String marker = "/uploads/";
        String relative = normalized;

        int lastIdx = normalized.lastIndexOf(marker);
        if (lastIdx >= 0) {
            relative = normalized.substring(lastIdx + marker.length());
        }

        int nestedIdx = relative.lastIndexOf("uploads/");
        if (nestedIdx >= 0) {
            relative = relative.substring(nestedIdx + "uploads/".length());
        }

        while (relative.startsWith("/")) {
            relative = relative.substring(1);
        }
        relative = relative.replace("..", "");
        while (relative.contains("//")) {
            relative = relative.replace("//", "/");
        }
        if (!relative.isBlank()) {
            return "https://devsiack.me/uploads/" + relative;
        }
        return null;
    }

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
            if (member == null || !member.isStatus()) continue; // 비활성 멤버 제외
            User memberUser = member.getUser();
            if (memberUser == null || !memberUser.isUseyn()) continue; // 비활성 사용자 제외
            String nickname = Optional.ofNullable(memberUser.getUserProfile())
                    .map(UserProfile::getNickname)
                    .orElse(memberUser.getUsername());
            Long profileImage = Optional.ofNullable(memberUser.getUserProfile())
                    .map(UserProfile::getProfileimg)
                    .orElse(null);
            String profileUrl;
            try {
                var urlDto = userService.getUserProfileURL(String.valueOf(memberUser.getUserid()));
                profileUrl = (urlDto != null) ? urlDto.getUrl() : null;
            } catch (Exception ignore) {
                profileUrl = null;
            }
            userDTOList.add(ResDTO_WorkspaceUser.builder()
                    .id(String.valueOf(memberUser.getUserid()))
                    .nickname(nickname)
                    .profileImage(profileImage)
                    .profileImageUrl((profileUrl != null && !profileUrl.isBlank()) ? profileUrl : null)
                    .build());
        }
        return userDTOList;
    }
}
