package com.dakgu.siack.websocket.chat.controller;

import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.dakgu.siack.websocket.chat.service.ChatHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatQueryController {

    private final ChatHistoryService chatHistoryService;

    // 대화 PK(CONVERSATIONID) 기준으로 최근 메시지 조회
    @GetMapping("/conversations/{conversationId}/messages")
    public List<ChatMessage> getMessagesByConversation(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        // TODO: 현재 로그인 유저가 이 Conversation에 접근 가능한지(워크스페이스/채널 멤버인지) 권한 체크 추가
        return chatHistoryService.getRecentMessagesByConversationId(conversationId, limit);
    }
}
