package com.dakgu.siack.websocket.chat.service;

import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.user.repository.UserRepository;
import com.dakgu.siack.websocket.chat.domain.Conversation;
import com.dakgu.siack.websocket.chat.domain.Message;
import com.dakgu.siack.websocket.chat.dto.ChatMessage;
import com.dakgu.siack.websocket.chat.dto.ChatMessageType;
import com.dakgu.siack.websocket.chat.redis.RedisChatPublisher;
import com.dakgu.siack.websocket.chat.repository.ConversationRepository;
import com.dakgu.siack.websocket.chat.repository.MessageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final RedisChatPublisher redisChatPublisher;
    private final ChatHistoryCache chatHistoryCache;

    /**
     * 채팅 메시지를 특정 대화방(Conversation)으로 전송하는 핵심 비즈니스 로직.
     *
     * 처리 단계:
     * 1) DTO 유효성 검사 (roomId, content 등 필수 값 확인)
     * 2) roomId(=ConversationID)를 이용해 대화방 존재 여부 확인
     * 3) sender(=UserID)를 이용해 발신자 존재 여부 확인
     *    - 추후 ConversationParticipant 등을 통해 "해당 방에 속한 유저인지" 권한 체크 추가 예정
     * 4) Message 엔티티 생성 후 DB에 저장
     * 5) DTO에 timestamp/type 기본값 세팅 (없을 경우)
     * 6) Redis Pub/Sub으로 메시지 발행 (다른 서버 인스턴스에도 실시간 전파)
     * 7) Redis 히스토리 캐시에 메시지 추가 (입장 시 과거 내역 조회용)
     */
    @Override
    @Transactional
    public void sendToRoom(ChatMessage dto) {
        validate(dto);

        // 2) 대화방 존재 여부 확인
        Conversation conversation = conversationRepository.findById(Long.valueOf(dto.getRoomId()))
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found: " + dto.getRoomId()));

        // 3) 발신자(User) 존재 여부 확인
        User sender = userRepository.findById(Long.valueOf(dto.getSender()))
                .orElseThrow(() -> new EntityNotFoundException("Sender not found: " + dto.getSender()));

        // TODO: 실제로는 ConversationParticipant 확인 등으로 방 참여 여부 검증 필요

        // 4) Message 엔티티 생성 및 저장
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(dto.getContent())
                .build();

        messageRepository.save(message);

        // 5) DTO 기본값 세팅
        if (dto.getTimestamp() == null) {
            dto.setTimestamp(Instant.now());
        }
        if (dto.getType() == null) {
            dto.setType(ChatMessageType.CHAT);
        }

        // 6) Redis Pub/Sub 발행 (실시간 브로드캐스트용)
        redisChatPublisher.publish(dto);
        // 7) Redis 히스토리 캐시에도 추가 (과거 메시지 조회 속도 향상)
        chatHistoryCache.appendMessage(dto);
    }

    /**
     * 사용자가 채팅방에 입장했을 때 JOIN 타입 메시지를 발행한다.
     *
     * - 현재는 DB에는 저장하지 않고 Redis Pub/Sub로만 전파
     * - 화면에서 "누가 입장했습니다" 같은 시스템 메시지 표현용으로 사용 가능
     */
    @Override
    @Transactional
    public void notifyJoin(String roomId, String username) {
        Objects.requireNonNull(roomId, "roomId is required");
        Conversation conversation;

        // 1) roomId가 숫자인 경우 해당 Conversation 조회, 없으면 새로 생성
        try {
            Long convId = Long.valueOf(roomId);
            conversation = conversationRepository.findById(convId)
                    .orElseGet(() -> {
                        Conversation c = new Conversation();
                        // 필요시 초기값 설정 (예: title, createdBy 등)
                        return conversationRepository.save(c);
                    });
        } catch (NumberFormatException ex) {
            // 2) roomId가 숫자가 아니면 새 Conversation 생성
            conversation = new Conversation();
            // 필요시 초기값 설정
            conversation = conversationRepository.save(conversation);
        }

        // DB에 저장된 실제 conversationId를 메시지에 반영
        String publishRoomId = String.valueOf(conversation.getConversationId());

        ChatMessage join = ChatMessage.builder()
                .type(ChatMessageType.JOIN)
                .roomId(publishRoomId)
                .sender(username)
                .timestamp(Instant.now())
                .build();

        // 권장: 퍼블리시는 트랜잭션 커밋 이후에 발생시키는 것이 안전함.
        // 현재 코드는 즉시 퍼블리시.
        // ApplicationEventPublisher + @TransactionalEventListener(AFTER_COMMIT)로 변경할 것.
        redisChatPublisher.publish(join);
    }

    /**
     * 사용자가 채팅방에서 나갔을 때 LEAVE 타입 메시지를 발행한다.
     *
     * - 마찬가지로 DB에는 저장하지 않고 Redis Pub/Sub로만 전파
     * - 화면에서 "누가 나갔습니다" 같은 시스템 메시지 표현용
     */
    @Override
    public void notifyLeave(String roomId, String username) {
        ChatMessage leave = ChatMessage.builder()
                .type(ChatMessageType.LEAVE)
                .roomId(roomId)
                .sender(username)
                .timestamp(Instant.now())
                .build();
        redisChatPublisher.publish(leave);
    }

    /**
     * 채팅 메시지 DTO의 필수 필드를 검증한다.
     *
     * - message 자체가 null이면 NPE를 던져 호출 측에서 버그를 빨리 발견할 수 있게 함
     * - roomId가 비어 있으면 IllegalArgumentException 발생
     * - content가 비어 있으면 IllegalArgumentException 발생
     *   (추후 길이 제한, 금칙어 필터링, XSS 방지 등의 추가 검증 로직을 넣을 수 있음)
     */
    private void validate(ChatMessage message) {
        Objects.requireNonNull(message, "message must not be null");
        if (message.getRoomId() == null || message.getRoomId().isBlank()) {
            throw new IllegalArgumentException("roomId is required");
        }
        if (message.getContent() == null || message.getContent().isBlank()) {
            throw new IllegalArgumentException("content is required");
        }
    }
}
