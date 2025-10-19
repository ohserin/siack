package com.dakgu.siack.websocket.chat.controller;

import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.dakgu.siack.websocket.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // 클라이언트가 /app/chat/{roomId}/send 로 전송하면 해당 방 구독자에게 브로드캐스트
    @MessageMapping("/chat/{roomId}/send")
    public void send(@DestinationVariable String roomId, ChatMessage message) {
        if (message != null) {
            message.setRoomId(roomId);
        }
        chatService.sendToRoom(message);
    }

    // 클라이언트가 /app/chat/{roomId}/join 로 전송하면 입장 알림 브로드캐스트
    @MessageMapping("/chat/{roomId}/join")
    public void join(@DestinationVariable String roomId, ChatMessage message) {
        String sender = message != null ? message.getSender() : null;
        chatService.notifyJoin(roomId, sender);
    }

    // 클라이언트가 /app/chat/{roomId}/leave 로 전송하면 퇴장 알림 브로드캐스트
    @MessageMapping("/chat/{roomId}/leave")
    public void leave(@DestinationVariable String roomId, ChatMessage message) {
        String sender = message != null ? message.getSender() : null;
        chatService.notifyLeave(roomId, sender);
    }
}

