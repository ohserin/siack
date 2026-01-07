package com.dakgu.siack.websocket.chat.controller;

import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.dakgu.siack.websocket.chat.redis.RedisChatHistoryCache;
import com.dakgu.siack.websocket.chat.service.ChatQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 채팅 관련 조회 전용 컨트롤러
 */
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatQueryController {

    private final ChatQueryService chatQueryService;
    private final RedisChatHistoryCache chatHistoryCache; // 채팅 내역 조회를 위한 의존성 추가

    /**
     * 워크스페이스 ID와 채널 ID를 기반으로 대화 ID(conversationId)를 조회합니다.
     *
     * @param workspaceId 워크스페이스의 고유 ID
     * @param channelId 채널의 고유 ID
     * @return JSON 형태의 응답 객체 (예: { "conversationId": 123 })
     */
    @GetMapping("/conversation")
    public ResponseEntity<Map<String, Long>> getConversationId(
            Authentication authentication,
            @RequestParam("workspaceId") Long workspaceId,
            @RequestParam("channelId") Long channelId) {

        Long conversationId = chatQueryService.getOrCreateConversation(authentication, workspaceId, channelId);
        return ResponseEntity.ok(Map.of("conversationId", conversationId));
    }

    /**
     * 대화(Conversation) ID를 기준으로 최근 메시지 목록을 조회합니다.
     *
     * @param conversationId 대화의 고유 ID
     * @param limit 조회할 메시지 개수 (기본값 50)
     * @return 채팅 메시지 목록
     */
    @GetMapping("/conversations/{conversationId}/messages")
    public List<ChatMessage> getMessagesByConversation(
            Authentication authentication,
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        chatQueryService.checkAccessAuthority(authentication, conversationId);
        return chatHistoryCache.getRecentMessages(String.valueOf(conversationId), limit);
    }
}
