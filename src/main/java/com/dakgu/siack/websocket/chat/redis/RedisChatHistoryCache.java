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

    /**
     * 주어진 roomId(= conversationId)에 대한 Redis 리스트 키를 생성한다.
     * 형식: chat:room:{roomId}:messages
     */
    private String keyForRoom(String roomId) {
        return "chat:room:" + roomId + ":messages";
    }

    /**
     * 단일 채팅 메시지를 히스토리 캐시에 추가한다.
     *
     * - Redis List 구조 사용
     *   - LPUSH로 최신 메시지를 리스트의 앞쪽에 삽입
     *   - LTRIM(0, 99)로 최근 100개까지만 유지
     * - TTL 24시간 설정 (오래 사용되지 않는 방의 캐시는 자연스럽게 만료)
     * - 직렬화 실패(JsonProcessingException)는 캐시 미스 정도로 보고 조용히 무시한다.
     */
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

    /**
     * 특정 roomId에 대해 Redis 히스토리 캐시에서 최근 limit개 메시지를 조회한다.
     *
     * - L RANGE 0 ~ limit-1 로 앞에서부터 읽어온다 (appendMessage가 최신을 앞에 넣으므로 최신순)
     * - 값은 JSON 문자열이므로 ChatMessage로 역직렬화
     * - 역직렬화에 실패한 항목은 무시하고 넘어간다.
     */
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

    /**
     * 주어진 roomId에 대해 메시지 리스트 전체를 한 번에 캐시에 저장한다.
     *
     * 주로 DB에서 과거 메시지를 조회한 뒤, 초기 캐시를 채울 때 사용한다.
     * - 전달받은 messages를 timestamp 기준으로 내림차순(최신 먼저) 정렬
     * - 기존 Redis 키를 삭제하고 새 리스트로 대체
     * - 최대 100개까지만 유지하고 TTL 24시간 적용
     */
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
