package com.dakgu.siack.websocket.chat.redis;

import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.dakgu.siack.websocket.chat.service.ChatHistoryCache;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class RedisChatHistoryCache implements ChatHistoryCache {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private String keyForRoom(String roomId) {
        return "chat:room:" + roomId + ":messages";
    }

    @Override
    public void appendMessage(ChatMessage message) {
        try {
            String key = keyForRoom(message.getRoomId());
            String json = objectMapper.writeValueAsString(message);
            redisTemplate.opsForList().leftPush(key, json);
            redisTemplate.opsForList().trim(key, 0, 99);
            redisTemplate.expire(key, Duration.ofHours(24));
        } catch (JsonProcessingException e) {
            // 로그만 남기고 캐시 실패는 무시
        }
    }

    @Override
    public List<ChatMessage> getRecentMessages(String roomId, int limit) {
        String key = keyForRoom(roomId);
        List<String> values = redisTemplate.opsForList().range(key, 0, limit - 1);
        if (values == null || values.isEmpty()) {
            return List.of();
        }
        return values.stream()
                .map(json -> {
                    try {
                        return objectMapper.readValue(json, ChatMessage.class);
                    } catch (JsonProcessingException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();
    }

    @Override
    public void saveAll(String roomId, List<ChatMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            return;
        }
        String key = keyForRoom(roomId);

        List<String> jsonList = messages.stream()
                .sorted(Comparator.comparing(ChatMessage::getTimestamp).reversed())
                .map(m -> {
                    try {
                        return objectMapper.writeValueAsString(m);
                    } catch (JsonProcessingException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();

        if (jsonList.isEmpty()) {
            return;
        }

        redisTemplate.delete(key);
        redisTemplate.opsForList().leftPushAll(key, jsonList);
        redisTemplate.opsForList().trim(key, 0, 99);
        redisTemplate.expire(key, Duration.ofHours(24));
    }
}

