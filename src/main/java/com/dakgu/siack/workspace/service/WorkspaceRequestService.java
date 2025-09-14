package com.dakgu.siack.workspace.service;

import com.dakgu.siack.user.service.UserService;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.utils.ResponseDTO;
import com.dakgu.siack.workspace.dto.CreateWorkspaceRequestDTO;
import com.dakgu.siack.workspace.dto.GetWorkspaceResponseDTO;
import com.dakgu.siack.workspace.repository.ChannelRepository;
import com.dakgu.siack.workspace.repository.ChannelMemberRepository;
import com.dakgu.siack.workspace.repository.WorkspaceRepository;
import com.dakgu.siack.workspace.repository.WorkspaceMemberRepository;
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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@RequiredArgsConstructor
@Service
public class WorkspaceRequestService {

    private final WorkspaceRepository workspaceRepository;
    private final UserService userService;
    private final ChannelRepository channelRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    /**
     * 워크스페이스를 생성합니다.
     * 인증된 사용자가 워크스페이스를 생성하면,
     * 워크스페이스와 기본 채널(이름: "일반")이 함께 생성되고,
     * 생성자는 해당 채널의 운영자(ADMIN)로 등록됩니다.
     *
     * @param authentication 인증 정보 (로그인 사용자)
     * @param request        워크스페이스 생성 요청 DTO (이름, 설명 등)
     * @return ResponseDTO (201: 성공, 404: 사용자 없음)
     */
    public ResponseDTO createWorkspace(Authentication authentication, CreateWorkspaceRequestDTO request) {
        User user = userService.getUserFromAuthentication(authentication);
        if (user == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");

        WorkspaceVO workspace = new WorkspaceVO();
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setOwner(user);
        workspaceRepository.save(workspace);

        WorkspaceMemberVO workspaceMember = WorkspaceMemberVO.builder()
                .workspace(workspace)
                .user(user)
                .role("OWNER")
                .status(true)
                .build();
        workspaceMemberRepository.save(workspaceMember);

        ChannelVO defaultChannel = new ChannelVO();
        defaultChannel.setWorkspace(workspace);
        defaultChannel.setName("일반");
        defaultChannel.setDescription("워크스페이스 채널");
        defaultChannel.setPrivate(false);
        defaultChannel.setStatus(true);
        channelRepository.save(defaultChannel);

        ChannelMemberVO member = new ChannelMemberVO();
        member.setChannel(defaultChannel);
        member.setUser(user);
        member.setRole("ADMIN");
        member.setStatus(true);
        channelMemberRepository.save(member);

        return new ResponseDTO(201, "워크스페이스가 생성되었습니다.");
    }

    /**
     * 워크스페이스를 삭제(비활성화)합니다.
     *
     * @param authentication 인증 정보 (로그인 사용자)
     * @param workspaceId    삭제할 워크스페이스 ID
     * @return ResponseDTO (200: 성공, 403: 권한없음, 404: 없음)
     */
    public ResponseDTO deleteWorkspace(Authentication authentication, Long workspaceId) {
        User user = userService.getUserFromAuthentication(authentication);
        if (user == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");
        }
        WorkspaceVO workspace = workspaceRepository.findById(workspaceId).orElse(null);
        if (workspace == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "워크스페이스를 찾을 수 없습니다.");
        }
        if (!workspace.getOwner().getUserid().equals(user.getUserid())) {
            return new ResponseDTO(HttpStatus.FORBIDDEN.value(), "워크스페이스 소유자만 삭제할 수 있습니다.");
        }
        workspace.setStatus(false);
        workspaceRepository.save(workspace);
        return new ResponseDTO(HttpStatus.OK.value(), "워크스페이스가 삭제(비활성화)되었습니다.");
    }

    /**
     * 사용자가 속한 모든 워크스페이스 목록을 조회합니다.
     * <p>
     * - 인증된 사용자의 워크스페이스 멤버십을 기준으로, 활성화된(비활성화되지 않은) 워크스페이스만 반환합니다.
     * - 각 워크스페이스의 소유자(ownerId), 이름, 설명, 멤버 목록(users)을 포함합니다.
     * - 멤버 목록에는 각 멤버의 userid, 닉네임, 프로필 이미지 ID가 포함됩니다.
     * - 비활성화된 계정(탈퇴/정지 등)은 멤버 목록에서 제외됩니다.
     *
     * @param authentication 인증 정보 (로그인 사용자)
     * @return 사용자가 속한 워크스페이스 목록 (GetWorkspaceResponseDTO 리스트)
     * (인증 실패 시 빈 리스트 반환)
     */
    @Transactional
    public List<GetWorkspaceResponseDTO> getWorkspaceList(Authentication authentication) {
        User user = userService.getUserFromAuthentication(authentication);
        if (user == null) {
            return new ArrayList<>();
        }

        List<WorkspaceMemberVO> myMemberships = workspaceMemberRepository.findByUser_Userid(user.getUserid());
        Set<Long> workspaceIdSet = new HashSet<>();
        List<GetWorkspaceResponseDTO> workspaceList = new ArrayList<>();

        for (WorkspaceMemberVO membership : myMemberships) {
            WorkspaceVO workspace = membership.getWorkspace();
            if (workspace == null || !workspace.isStatus() || workspaceIdSet.contains(workspace.getWorkspaceId()))
                continue;
            workspaceIdSet.add(workspace.getWorkspaceId());

            Long ownerId = null;
            if (workspace.getOwner() != null) {
                ownerId = workspace.getOwner().getUserid();
            }

            List<WorkspaceMemberVO> members = workspaceMemberRepository.findByWorkspace_WorkspaceId(workspace.getWorkspaceId());
            List<com.dakgu.siack.workspace.dto.WorkspaceUserDTO> userDTOList = new ArrayList<>();
            for (WorkspaceMemberVO member : members) {
                User memberUser = member.getUser();
                if (memberUser == null || !memberUser.isUseyn()) continue;
                String nickname;
                Long profileImage = null;
                if (memberUser.getUserProfile() != null) {
                    nickname = memberUser.getUserProfile().getNickname();
                    if (memberUser.getUserProfile().getProfileimg() != null) {
                        profileImage = memberUser.getUserProfile().getProfileimg();
                    }
                } else {
                    nickname = memberUser.getUsername();
                }
                userDTOList.add(new com.dakgu.siack.workspace.dto.WorkspaceUserDTO(
                        memberUser.getUserid().toString(),
                        nickname,
                        profileImage
                ));
            }
            GetWorkspaceResponseDTO dto = new GetWorkspaceResponseDTO();
            dto.setWorkspaceId(workspace.getWorkspaceId());
            dto.setName(workspace.getName());
            dto.setDescription(workspace.getDescription());
            dto.setOwnerId(ownerId);
            dto.setUsers(userDTOList);
            workspaceList.add(dto);
        }
        return workspaceList;
    }

}
