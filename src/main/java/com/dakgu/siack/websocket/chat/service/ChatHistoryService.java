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

    /**
     * 대화 PK(CONVERSATIONID)를 기준으로 최근 채팅 메시지를 조회한다.
     *
     * 동작 흐름:
     * 1) Redis 히스토리 캐시에서 먼저 조회
     *    - 키: chat:room:{conversationId}:messages
     *    - 캐시가 존재하면 DB를 조회하지 않고 바로 반환
     * 2) 캐시에 없으면 DB에서 sdc_message를 조회
     *    - Conversation 엔티티를 로드한 뒤, 해당 Conversation에 속한 Message를
     *      createdAt(= createdat) 기준 내림차순으로 limit개 조회
     * 3) Message 엔티티 리스트를 ChatMessage DTO 리스트로 변환
     * 4) 변환된 DTO 리스트를 Redis 캐시에 저장해 이후 요청을 빠르게 처리
     */
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

        List<Message> messages = messageRepository.findByConversationOrderByCreatedatDesc(
                conversation,
                PageRequest.of(0, limit)
        );

        List<ChatMessage> dtoList = messages.stream()
                .map(this::toDto)
                .toList();

        // 3) Redis 캐시에 적재 (추가 요청부터는 캐시에서 바로 응답)
        chatHistoryCache.saveAll(String.valueOf(conversationId), dtoList);

        return dtoList;
    }

    /**
     * Message 엔티티 하나를 WebSocket/REST에서 사용하는 ChatMessage DTO로 변환한다.
     *
     * 매핑 규칙:
     * - roomId   : Conversation.conversationId (대화 PK)
     * - sender   : User.userid (보낸 사람 PK)
     * - content  : Message.content (본문)
     * - timestamp: Timestamp.createdat을 Instant로 변환하여 사용
     *
     * 현재는 type을 항상 CHAT으로 고정하고 있으나,
     * 향후 시스템 메시지(JOIN/LEAVE 등)를 엔티티로 저장한다면
     * 별도의 컬럼을 두고 이 값으로부터 타입을 매핑할 수 있다.
     */
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
