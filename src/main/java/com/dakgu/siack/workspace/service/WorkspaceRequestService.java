package com.dakgu.siack.workspace.service;

import com.dakgu.siack.user.service.UserService;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.utils.ResponseDTO;
import com.dakgu.siack.workspace.dto.WorkspaceRequestDTO;
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
     * @param request 워크스페이스 생성 요청 DTO (이름, 설명 등)
     * @return ResponseDTO (201: 성공, 404: 사용자 없음)
     */
    public ResponseDTO createWorkspace(Authentication authentication, WorkspaceRequestDTO request) {
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
     * @param workspaceId 삭제할 워크스페이스 ID
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

    public ResponseDTO getWorkspaceList(Authentication authentication) {
        User user = userService.getUserFromAuthentication(authentication);
        if (user == null) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없습니다.");
        }




        return null;
    }

}
