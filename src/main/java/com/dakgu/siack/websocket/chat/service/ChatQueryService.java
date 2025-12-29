package com.dakgu.siack.websocket.chat.service;

import org.springframework.security.core.Authentication;

/**
 * 채팅 관련 조회 전용 서비스 인터페이스
 */
public interface ChatQueryService {

    /**
     * 워크스페이스 ID와 채널 ID에 해당하는 대화(Conversation)가 있는지 확인하고,
     * 없으면 새로 생성한 후 해당 대화의 ID를 반환합니다.
     * 이 과정에서 사용자가 해당 워크스페이스의 멤버인지 권한을 확인합니다.
     *
     * @param authentication 인증 정보
     * @param workspaceId 워크스페이스 ID
     * @param channelId 채널 ID
     * @return 조회 또는 생성된 대화(Conversation)의 ID
     */
    Long getOrCreateConversation(Authentication authentication, Long workspaceId, Long channelId);

    /**
     * 사용자가 특정 대화(Conversation)에 접근할 권한이 있는지 확인합니다.
     *
     * @param authentication 인증 정보
     * @param conversationId 대화 ID
     * @throws org.springframework.security.access.AccessDeniedException 권한이 없는 경우
     */
    void checkAccessAuthority(Authentication authentication, Long conversationId);
}
