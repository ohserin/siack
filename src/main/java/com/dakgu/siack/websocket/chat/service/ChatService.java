package com.dakgu.siack.websocket.chat.service;

import com.dakgu.siack.file.repository.SdfFileRepository;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.user.repository.UserRepository;
import com.dakgu.siack.user.vo.UserProfile;
import com.dakgu.siack.websocket.chat.domain.Conversation;
import com.dakgu.siack.websocket.chat.domain.Message;
import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.dakgu.siack.websocket.chat.dto.ChatMessageType;
import com.dakgu.siack.websocket.chat.event.ChatMessageEvent;
import com.dakgu.siack.websocket.chat.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final MessageBatchService messageBatchService;
    private final ApplicationEventPublisher eventPublisher;
    private final SdfFileRepository fileRepository;

    @Value("${file.access.url-base}")
    private String imageUrlBase;

    @Transactional
    public void sendToRoom(ChatMessage dto) {
        validate(dto);

        Conversation conversation = conversationRepository.getReferenceById(Long.valueOf(dto.getRoomId()));
        User sender = userRepository.getReferenceById(Long.valueOf(dto.getSender()));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(dto.getContent())
                .build();

        messageBatchService.addMessageToQueue(message);

        UserProfile profile = sender.getUserProfile();
        if (profile != null) {
            dto.setNickname(profile.getNickname());

            // 이미지 URL 생성
            if (profile.getProfileimg() != null) {
                String fileName = fileRepository.findStoredFileNameByFileId(profile.getProfileimg());
                if (fileName != null) {
                    dto.setProfileImageUrl(imageUrlBase + fileName);
                }
            }
        }

        if (dto.getTimestamp() == null) dto.setTimestamp(Instant.now());
        if (dto.getType() == null) dto.setType(ChatMessageType.CHAT);

        // 트랜잭션 커밋 후 Redis 작업을 처리하도록 이벤트 발행
        eventPublisher.publishEvent(new ChatMessageEvent(this, dto));
    }

    @Transactional
    public void notifyJoin(String roomId, String username) {
        Objects.requireNonNull(roomId, "roomId is required");
        Objects.requireNonNull(username, "username is required");

        Conversation conversation = findOrCreateConversation(roomId);
        String publishRoomId = String.valueOf(conversation.getConversationId());

        ChatMessage join = ChatMessage.builder()
                .type(ChatMessageType.JOIN)
                .roomId(publishRoomId)
                .sender(username)
                .timestamp(Instant.now())
                .build();

        // 트랜잭션 커밋 후 Redis 작업을 처리하도록 이벤트 발행
        eventPublisher.publishEvent(new ChatMessageEvent(this, join));
    }

    public void notifyLeave(String roomId, String username) {
        ChatMessage leave = ChatMessage.builder()
                .type(ChatMessageType.LEAVE)
                .roomId(roomId)
                .sender(username)
                .timestamp(Instant.now())
                .build();

        // LEAVE는 트랜잭션과 무관하므로 즉시 발행도 가능하나, 일관성을 위해 이벤트로 처리
        eventPublisher.publishEvent(new ChatMessageEvent(this, leave));
    }

    private void validate(ChatMessage message) {
        Objects.requireNonNull(message, "message must not be null");
        if (message.getRoomId() == null || message.getRoomId().isBlank()) {
            throw new IllegalArgumentException("roomId is required");
        }
        if (message.getContent() == null || message.getContent().isBlank()) {
            throw new IllegalArgumentException("content is required");
        }
    }

    private Conversation findOrCreateConversation(String roomId) {
        try {
            Long convId = Long.valueOf(roomId);
            return conversationRepository.findById(convId)
                    .orElseGet(this::createNewConversation);
        } catch (NumberFormatException ex) {
            return createNewConversation();
        }
    }

    private Conversation createNewConversation() {
        return conversationRepository.save(new Conversation());
    }
}
