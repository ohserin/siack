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

    /**
     * 채팅 메시지를 Redis Pub/Sub 채널로 발행한다.
     *
     * - 채널 이름 규칙: chat.room.{roomId}
     *   - roomId는 ConversationID(대화 PK)를 그대로 사용
     *   - 동일 roomId를 구독 중인 모든 노드의 RedisChatSubscriber가 메시지를 수신
     * - payload는 ChatMessage DTO를 JSON 문자열로 직렬화한 값
     * - 직렬화 실패 시 경고 로그만 남기고 예외는 전파하지 않는다
     */
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
