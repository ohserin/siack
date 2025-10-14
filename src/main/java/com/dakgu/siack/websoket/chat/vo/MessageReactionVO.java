package com.dakgu.siack.websoket.chat.vo;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 메시지 리액션 VO - sdc_message_reaction
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = {"messageId", "userId", "emoji"})
@Entity
@Table(
        name = "sdc_message_reaction",
        indexes = {
                @Index(name = "idx_msg", columnList = "MESSAGEID")
        }
)
@IdClass(MessageReactionId.class)
public class MessageReactionVO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * MESSAGEID (PK, FK -> sdc_message.MESSAGEID)
     */
    @Id
    @Column(name = "MESSAGEID", nullable = false)
    private Long messageId;

    /**
     * USERID (PK, FK -> sdu_user.USERID)
     */
    @Id
    @Column(name = "USERID", nullable = false)
    private Integer userId;

    /**
     * EMOJI (PK)
     */
    @Id
    @Column(name = "EMOJI", length = 64, nullable = false)
    private String emoji;

    /**
     * 생성 일시 (default CURRENT_TIMESTAMP)
     */
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 메시지 엔티티 참조 (읽기 전용)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MESSAGEID", insertable = false, updatable = false)
    private MessageVO message;

    @PrePersist
    private void onPrePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

