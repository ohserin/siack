package com.dakgu.siack.websocket.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private ChatMessageType type; // CHAT, JOIN, LEAVE
    private String roomId;
    private String sender;
    private String content;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
