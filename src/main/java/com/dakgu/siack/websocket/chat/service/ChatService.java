package com.dakgu.siack.websocket.chat.service;

import com.dakgu.siack.websocket.chat.dto.ChatMessageType;
import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final SimpMessagingTemplate messagingTemplate;

    private String destinationForRoom(String roomId) {
        return "/topic/chat/rooms/" + roomId;
    }

    public void sendToRoom(ChatMessage message) {
        validate(message);
        if (message.getTimestamp() == null) {
            message.setTimestamp(Instant.now());
        }
        messagingTemplate.convertAndSend(destinationForRoom(message.getRoomId()), message);
    }

    public void notifyJoin(String roomId, String username) {
        ChatMessage join = ChatMessage.builder()
                .type(ChatMessageType.JOIN)
                .roomId(roomId)
                .sender(username)
                .timestamp(Instant.now())
                .build();
        messagingTemplate.convertAndSend(destinationForRoom(roomId), join);
    }

    public void notifyLeave(String roomId, String username) {
        ChatMessage leave = ChatMessage.builder()
                .type(ChatMessageType.LEAVE)
                .roomId(roomId)
                .sender(username)
                .timestamp(Instant.now())
                .build();
        messagingTemplate.convertAndSend(destinationForRoom(roomId), leave);
    }

    private void validate(ChatMessage message) {
        Objects.requireNonNull(message, "message must not be null");
        if (message.getRoomId() == null || message.getRoomId().isBlank()) {
            throw new IllegalArgumentException("roomId is required");
        }
        if (message.getType() == null) {
            message.setType(ChatMessageType.CHAT);
        }
    }
}
