package com.dakgu.siack.websocket.chat.redis;

import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisChatPublisher {

    private static final Logger log = LoggerFactory.getLogger(RedisChatPublisher.class);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public void publish(ChatMessage message) {
        try {
            String payload = objectMapper.writeValueAsString(message);
            String channel = "chat.room." + message.getRoomId();
            redisTemplate.convertAndSend(channel, payload);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize chat message for Redis Pub/Sub", e);
        }
    }
}

