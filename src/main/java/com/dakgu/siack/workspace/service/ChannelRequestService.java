package com.dakgu.siack.workspace.service;

import com.dakgu.siack.user.service.UserService;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.utils.ResponseDTO;
import com.dakgu.siack.workspace.dto.ReqDTO_CreateChannel;
import com.dakgu.siack.workspace.repository.*;
import com.dakgu.siack.workspace.vo.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChannelRequestService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ChannelRepository channelRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final UserService userService;

    /**
     * 워크스페이스 내 채널을 생성합니다.
     * 1) 인증된 유저 확인
     * 2) 워크스페이스 존재/활성 여부 확인
     * 3) 유저가 해당 워크스페이스 멤버인지 확인
     * 4) 채널 이름 중복(대소문자 무시) 방지
     * 5) 채널 생성 및 생성자를 ADMIN 권한 멤버로 추가
     *
     * @param authentication 인증 객체
     * @param workspaceId 채널을 생성할 워크스페이스 ID
     * @param request 채널 생성 요청 DTO (name 필수)
     * @return ResponseDTO (201 성공, 400 잘못된 요청, 403 권한없음, 409 중복이름)
     */
    @Transactional
    public ResponseDTO createChannel(Authentication authentication, Long workspaceId, ReqDTO_CreateChannel request) {
        User user = Optional.ofNullable(userService.getUserFromAuthentication(authentication))
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        if (workspaceId == null) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "워크스페이스 ID가 필요합니다.");
        }
        if (request == null || request.getName() == null || request.getName().trim().isEmpty()) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "채널 이름은 필수입니다.");
        }
        String normalizedName = request.getName().trim();

        WorkspaceVO workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));
        if (!workspace.isStatus()) {
            return new ResponseDTO(HttpStatus.BAD_REQUEST.value(), "삭제된 워크스페이스입니다.");
        }

        // 워크스페이스 멤버 여부 확인
        boolean isMember = workspaceMemberRepository
                .findByWorkspace_WorkspaceIdAndUser_Userid(workspaceId, user.getUserid())
                .filter(WorkspaceMemberVO::isStatus)
                .isPresent();
        if (!isMember) {
            return new ResponseDTO(HttpStatus.FORBIDDEN.value(), "워크스페이스 멤버만 채널을 생성할 수 있습니다.");
        }

        // 이름 중복 검사 (동일 워크스페이스 내 case-insensitive)
        if (channelRepository.existsByWorkspace_WorkspaceIdAndNameIgnoreCase(workspaceId, normalizedName)) {
            return new ResponseDTO(HttpStatus.CONFLICT.value(), "이미 존재하는 채널 이름입니다.");
        }

        ChannelVO channel = ChannelVO.builder()
                .workspace(workspace)
                .name(normalizedName)
                .description(request.getDescription())
                .isPrivate(request.isPrivate())
                .status(true)
                .build();
        channelRepository.save(channel);

        ChannelMemberVO creatorMembership = ChannelMemberVO.builder()
                .channel(channel)
                .user(user)
                .role("ADMIN")
                .status(true)
                .build();
        channelMemberRepository.save(creatorMembership);

        return new ResponseDTO(HttpStatus.CREATED.value(), "채널이 생성되었습니다.");
    }
}

