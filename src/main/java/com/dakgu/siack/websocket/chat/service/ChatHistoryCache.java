package com.dakgu.siack.websocket.chat.service;

import com.dakgu.siack.websocket.chat.dto.ChatMessage;

import java.util.List;

public interface ChatHistoryCache {

    void appendMessage(ChatMessage message);

    List<ChatMessage> getRecentMessages(String roomId, int limit);

    void saveAll(String roomId, List<ChatMessage> messages);
}

