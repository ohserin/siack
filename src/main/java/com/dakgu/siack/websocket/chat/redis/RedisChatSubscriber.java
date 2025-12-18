package com.dakgu.siack.websocket.chat.redis;

import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;

/**
 * Redis Pub/Sub으로 들어온 채팅 메시지를 수신해서
 * STOMP 브로커("/topic/chat/rooms/{roomId}")로 재전송하는 역할을 하는 구독자.
 *
 * - 여러 서버 인스턴스를 띄워도, 한 인스턴스가 발행한 메시지를
 *   다른 인스턴스들도 Redis 구독을 통해 동일하게 받아서 클라이언트에 브로드캐스트함
 * - Redis에는 ChatMessage DTO가 JSON 문자열로 올라오고, 여기서 역직렬화 후 STOMP로 전달
 */
@Component
@RequiredArgsConstructor
public class RedisChatSubscriber implements MessageListener {

    private static final Logger log = LoggerFactory.getLogger(RedisChatSubscriber.class);

    // STOMP로 클라이언트에게 메시지를 보내는 템플릿
    private final SimpMessagingTemplate messagingTemplate;
    // JSON <-> 객체 변환용 ObjectMapper
    private final ObjectMapper objectMapper;

    /**
     * Redis Pub/Sub 채널로부터 수신된 메시지를 처리한다.
     *
     * 처리 순서:
     * 1) Redis에서 온 바이트 배열을 UTF-8 문자열(JSON)로 변환
     * 2) JSON 문자열을 ChatMessage 객체로 역직렬화
     * 3) ChatMessage.roomId를 이용해 STOMP 목적지 "/topic/chat/room/{roomId}" 구성
     * 4) messagingTemplate.convertAndSend(...)로 해당 목적지에 브로드캐스트
     *
     * 역직렬화 실패 등 예외가 발생하면 경고 로그를 남기고 해당 메시지만 무시한다.
     */
    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String json = new String(message.getBody(), StandardCharsets.UTF_8);
            ChatMessage chat = objectMapper.readValue(json, ChatMessage.class);
            String dest = "/topic/chat/room/" + chat.getRoomId();
            messagingTemplate.convertAndSend(dest, chat);
        } catch (Exception e) {
            log.warn("Redis Pub/Sub 메시지 처리 실패", e);
        }
    }
}
