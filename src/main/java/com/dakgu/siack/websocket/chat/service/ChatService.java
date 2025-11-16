package com.dakgu.siack.websocket.chat.service;

import com.dakgu.siack.websocket.chat.dto.ChatMessage;

public interface ChatService {

    void sendToRoom(ChatMessage message);

    void notifyJoin(String roomId, String username);

    void notifyLeave(String roomId, String username);
}
