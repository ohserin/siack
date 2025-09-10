package com.dakgu.siack.workspace.service;

import com.dakgu.siack.user.repository.UserRepository;
import com.dakgu.siack.user.service.UserService;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.utils.ResponseDTO;
import com.dakgu.siack.workspace.dto.WorkspaceRequestDTO;
import com.dakgu.siack.workspace.repository.ChannelRepository;
import com.dakgu.siack.workspace.repository.ChannelMemberRepository;
import com.dakgu.siack.workspace.repository.WorkspaceRepository;
import com.dakgu.siack.workspace.vo.ChannelMemberVO;
import com.dakgu.siack.workspace.vo.ChannelVO;
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

    /**
     * 워크스페이스를 생성합니다. 인증된 사용자가 워크스페이스를 생성하면,
     * 워크스페이스와 기본 채널(이름: "일반")이 함께 생성되고,
     * 생성자는 해당 채널의 운영자(ADMIN)로 등록됩니다.
     *
     * 동작 흐름:
     *   인증 정보에서 사용자 정보를 조회합니다.
     *   사용자가 존재하지 않으면 404 응답을 반환합니다.
     *   워크스페이스 엔티티를 생성 및 저장합니다.
     *   기본 채널(일반)을 생성 및 저장합니다.
     *   생성자를 기본 채널의 ADMIN 멤버로 등록합니다.
     *   성공 시 201 응답을 반환합니다.
     *
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

        // 디폴트 채널 생성
        ChannelVO defaultChannel = new ChannelVO();
        defaultChannel.setWorkspace(workspace);
        defaultChannel.setName("일반");
        defaultChannel.setDescription("워크스페이스 채널");
        defaultChannel.setPrivate(false);
        defaultChannel.setStatus(true);
        channelRepository.save(defaultChannel);

        // 생성자를 디폴트 채널 운영자로 등록
        ChannelMemberVO member = new ChannelMemberVO();
        member.setChannel(defaultChannel);
        member.setUser(user);
        member.setRole("ADMIN");
        member.setStatus(true);
        channelMemberRepository.save(member);

        return new ResponseDTO(201, "워크스페이스가 생성되었습니다.");
    }
}
