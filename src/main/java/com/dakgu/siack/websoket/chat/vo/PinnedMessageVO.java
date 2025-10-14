package com.dakgu.siack.websoket.chat.vo;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 핀 고정 메시지 VO - sdc_pinned_message
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = {"conversationId", "messageId"})
@Entity
@Table(name = "sdc_pinned_message")
@IdClass(PinnedMessageId.class)
public class PinnedMessageVO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * CONVERSATIONID (PK, FK -> sdc_conversation.CONVERSATIONID)
     */
    @Id
    @Column(name = "CONVERSATIONID", nullable = false)
    private Long conversationId;

    /**
     * MESSAGEID (PK, FK -> sdc_message.MESSAGEID)
     */
    @Id
    @Column(name = "MESSAGEID", nullable = false)
    private Long messageId;

    /**
     * PINNEDBY (FK -> sdu_user.USERID)
     */
    @Column(name = "PINNEDBY", nullable = false)
    private Integer pinnedBy;

    /**
     * PINNEDAT (default CURRENT_TIMESTAMP)
     */
    @Column(name = "PINNEDAT", nullable = false, updatable = false)
    private LocalDateTime pinnedAt;

    /**
     * 대화 엔티티 참조 (읽기 전용)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONVERSATIONID", insertable = false, updatable = false)
    private ConversationVO conversation;

    /**
     * 메시지 엔티티 참조 (읽기 전용)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MESSAGEID", insertable = false, updatable = false)
    private MessageVO message;

    @PrePersist
    private void onPrePersist() {
        if (pinnedAt == null) {
            pinnedAt = LocalDateTime.now();
        }
    }
}

