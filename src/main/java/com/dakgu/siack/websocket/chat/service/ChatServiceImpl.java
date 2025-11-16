package com.dakgu.siack.websocket.chat.service;

import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.user.vo.UserRepository;
import com.dakgu.siack.websocket.chat.domain.Conversation;
import com.dakgu.siack.websocket.chat.domain.Message;
import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.dakgu.siack.websocket.chat.dto.ChatMessageType;
import com.dakgu.siack.websocket.chat.redis.RedisChatPublisher;
import com.dakgu.siack.websocket.chat.repository.ConversationRepository;
import com.dakgu.siack.websocket.chat.repository.MessageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final RedisChatPublisher redisChatPublisher;

    @Override
    @Transactional
    public void sendToRoom(ChatMessage dto) {
        validate(dto);

        // 권한 체크: 대화방 존재 여부 및 참여자 조회 (간단 예시)
        Conversation conversation = conversationRepository.findById(Long.valueOf(dto.getRoomId()))
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found: " + dto.getRoomId()));

        User sender = userRepository.findById(Long.valueOf(dto.getSender()))
                .orElseThrow(() -> new EntityNotFoundException("Sender not found: " + dto.getSender()));

        // TODO: 실제로는 ConversationParticipant 확인 등으로 방 참여 여부 검증 필요

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(dto.getContent())
                .build();

        messageRepository.save(message);

        if (dto.getTimestamp() == null) {
            dto.setTimestamp(Instant.now());
        }
        if (dto.getType() == null) {
            dto.setType(ChatMessageType.CHAT);
        }

        // Redis Pub/Sub 발행
        redisChatPublisher.publish(dto);
    }

    @Override
    public void notifyJoin(String roomId, String username) {
        ChatMessage join = ChatMessage.builder()
                .type(ChatMessageType.JOIN)
                .roomId(roomId)
                .sender(username)
                .timestamp(Instant.now())
                .build();
        redisChatPublisher.publish(join);
    }

    @Override
    public void notifyLeave(String roomId, String username) {
        ChatMessage leave = ChatMessage.builder()
                .type(ChatMessageType.LEAVE)
                .roomId(roomId)
                .sender(username)
                .timestamp(Instant.now())
                .build();
        redisChatPublisher.publish(leave);
    }

    private void validate(ChatMessage message) {
        Objects.requireNonNull(message, "message must not be null");
        if (message.getRoomId() == null || message.getRoomId().isBlank()) {
            throw new IllegalArgumentException("roomId is required");
        }
        if (message.getContent() == null || message.getContent().isBlank()) {
            throw new IllegalArgumentException("content is required");
        }
    }
}

