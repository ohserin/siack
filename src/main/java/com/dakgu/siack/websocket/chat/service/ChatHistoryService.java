package com.dakgu.siack.websocket.chat.service;

import com.dakgu.siack.file.repository.SdfFileRepository;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.user.vo.UserProfile;
import com.dakgu.siack.websocket.chat.domain.Conversation;
import com.dakgu.siack.websocket.chat.domain.Message;
import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.dakgu.siack.websocket.chat.dto.ChatMessageType;
import com.dakgu.siack.websocket.chat.redis.RedisChatHistoryCache;
import com.dakgu.siack.websocket.chat.repository.ConversationRepository;
import com.dakgu.siack.websocket.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatHistoryService {

    private final RedisChatHistoryCache chatHistoryCache;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final SdfFileRepository fileRepository;

    @Value("${file.access.url-base}")
    private String imageUrlBase;

    @Transactional(readOnly = true)
    public List<ChatMessage> getRecentMessagesByConversationId(Long conversationId, int limit) {
        // 1) Redis 캐시 조회
        List<ChatMessage> cached = chatHistoryCache.getRecentMessages(String.valueOf(conversationId), limit);
        if (!cached.isEmpty()) return cached;

        // 2) DB 조회
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + conversationId));

        List<Message> messages = messageRepository.findByConversationOrderByCreatedatDesc(
                conversation,
                PageRequest.of(0, limit)
        );

        // 3) DTO 변환
        List<ChatMessage> dtoList = messages.stream()
                .map(this::toDto)
                .toList();

        // 4) 캐시 저장
        chatHistoryCache.saveAll(String.valueOf(conversationId), dtoList);

        return dtoList;
    }

    private ChatMessage toDto(Message m) {
        ChatMessage dto = ChatMessage.builder()
                .type(ChatMessageType.CHAT)
                .roomId(String.valueOf(m.getConversation().getConversationId()))
                .sender(String.valueOf(m.getSender().getUserid()))
                .content(m.getContent())
                .timestamp(m.getCreatedat().toInstant())
                .build();

        User sender = m.getSender();
        if (sender != null && sender.getUserProfile() != null) {
            UserProfile profile = sender.getUserProfile();
            dto.setNickname(profile.getNickname());

            if (profile.getProfileimg() != null) {
                String fileName = fileRepository.findStoredFileNameByFileId(profile.getProfileimg());
                if (fileName != null) {
                    dto.setProfileImageUrl(imageUrlBase + fileName);
                }
            }
        }

        return dto;
    }
}
