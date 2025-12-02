package com.dakgu.siack.websocket.chat.event;

import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * ChatMessage 관련 이벤트를 정의하는 클래스.
 * ApplicationEvent를 상속받아 Spring 이벤트 시스템과 연동됩니다.
 */
@Getter
public class ChatMessageEvent extends ApplicationEvent {
    private final ChatMessage chatMessage;

    public ChatMessageEvent(Object source, ChatMessage chatMessage) {
        super(source);
        this.chatMessage = chatMessage;
    }
}
