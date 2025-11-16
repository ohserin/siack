package com.dakgu.siack.websocket.chat.service;

import com.dakgu.siack.websocket.chat.domain.Conversation;
import com.dakgu.siack.websocket.chat.domain.Message;
import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.dakgu.siack.websocket.chat.dto.ChatMessageType;
import com.dakgu.siack.websocket.chat.repository.ConversationRepository;
import com.dakgu.siack.websocket.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatHistoryService {

    private final ChatHistoryCache chatHistoryCache;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;

    @Transactional(readOnly = true)
    public List<ChatMessage> getRecentMessagesByConversationId(Long conversationId, int limit) {
        // 1) Redis 캐시 먼저 조회
        List<ChatMessage> cached = chatHistoryCache.getRecentMessages(String.valueOf(conversationId), limit);
        if (!cached.isEmpty()) {
            return cached;
        }

        // 2) 캐시가 없으면 DB 조회
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + conversationId));

        List<Message> messages = messageRepository.findByConversationOrderByCreatedAtDesc(
                conversation,
                PageRequest.of(0, limit)
        );

        List<ChatMessage> dtoList = messages.stream()
                .map(this::toDto)
                .toList();

        // 3) Redis 캐시에 적재
        chatHistoryCache.saveAll(String.valueOf(conversationId), dtoList);

        return dtoList;
    }

    private ChatMessage toDto(Message m) {
        return ChatMessage.builder()
                .type(ChatMessageType.CHAT)
                .roomId(String.valueOf(m.getConversation().getConversationId()))
                .sender(String.valueOf(m.getSender().getUserid()))
                .content(m.getContent())
                .timestamp(m.getCreatedat().toInstant())
                .build();
    }
}
