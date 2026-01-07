package com.dakgu.siack.websocket.chat.listener;

import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.dakgu.siack.websocket.chat.dto.ChatMessageType;
import com.dakgu.siack.websocket.chat.event.ChatMessageEvent;
import com.dakgu.siack.websocket.chat.redis.RedisChatHistoryCache;
import com.dakgu.siack.websocket.chat.redis.RedisChatPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * ChatMessageEvent를 수신하여 실제 Redis 작업을 처리하는 이벤트 리스너.
 *
 * @TransactionalEventListener를 통해 트랜잭션의 특정 시점(AFTER_COMMIT)에 작업을 수행하여
 * 데이터베이스 트랜잭션과 외부 시스템(Redis) 호출을 분리합니다.
 */
@Component
@RequiredArgsConstructor
public class ChatMessageEventListener {

    private final RedisChatPublisher redisChatPublisher;
    private final RedisChatHistoryCache chatHistoryCache;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 트랜잭션이 성공적으로 커밋된 후 ChatMessageEvent를 처리합니다.
     * @param event a {@link ChatMessageEvent}
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleChatMessage(ChatMessageEvent event) {
        ChatMessage dto = event.getChatMessage();

        // 1. Redis Pub/Sub으로 메시지 발행
        redisChatPublisher.publish(dto);

        // 2. CHAT 타입 메시지만 Redis 캐시에 저장
        if (dto.getType() == ChatMessageType.CHAT) {
            chatHistoryCache.appendMessage(dto);
        }

        messagingTemplate.convertAndSend("/topic/chat/rooms/" + dto.getRoomId(), dto);
    }
}
