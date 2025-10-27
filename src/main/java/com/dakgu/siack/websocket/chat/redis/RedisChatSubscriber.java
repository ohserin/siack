package com.dakgu.siack.websocket.chat.redis;

import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/*
 * Redis Pub/Sub으로 들어온 채팅 이벤트를 받아서
 * STOMP 목적지("/topic/chat/rooms/{roomId}")로 재전송함.
 *
 * - 다중 인스턴스에서 한 노드가 발행한 메시지를
 *   다른 노드도 받아 동일하게 브로드캐스트하게 함
 * - Redis에는 JSON 문자열로 올라옴 → ChatMessage로 역직렬화 후 전송함
 * - JSON 스키마/코드 안 맞으면 역직렬화 예외 날 수 있으니 주의
 */
@Component
@RequiredArgsConstructor
public class RedisChatSubscriber implements MessageListener {

    private static final Logger log = LoggerFactory.getLogger(RedisChatSubscriber.class);

    // STOMP로 클라이언트에게 메시지 보내는 템플릿
    private final SimpMessagingTemplate messagingTemplate;
    // JSON <-> 객체 변환용. 스프링 ObjectMapper 주입받아 사용
    private final ObjectMapper objectMapper;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        // 수신 흐름
        // 1) 바이트 바디 -> UTF-8 문자열 변환
        // 2) JSON -> ChatMessage 역직렬화
        // 3) 방 ID로 STOMP 목적지 경로 구성
        // 4) convertAndSend로 브로드캐스트
        try {
            String json = new String(message.getBody(), StandardCharsets.UTF_8);
            ChatMessage chat = objectMapper.readValue(json, ChatMessage.class);
            String dest = "/topic/chat/rooms/" + chat.getRoomId();
            messagingTemplate.convertAndSend(dest, chat);
        } catch (Exception e) {
            log.warn("Redis Pub/Sub 메시지 처리 실패", e);
        }
    }
}
