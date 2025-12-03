package com.dakgu.siack.websocket.chat.service;

/**
 * 채팅 관련 조회 전용 서비스 인터페이스
 *
 * @author AI Assistant
 */
public interface ChatQueryService {

    /**
     * 워크스페이스 ID와 채널 ID에 해당하는 대화(Conversation)가 있는지 확인하고,
     * 없으면 새로 생성한 후 해당 대화의 ID를 반환합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param channelId 채널 ID
     * @return 조회 또는 생성된 대화(Conversation)의 ID
     */
    Long getOrCreateConversationId(Long workspaceId, Long channelId);
}
