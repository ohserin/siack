package com.dakgu.siack.websoket.chat.vo;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 대화 참여자 VO - sdc_conversation_participant
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = {"conversationId", "userId"})
@Entity
@Table(
        name = "sdc_conversation_participant",
        indexes = {
                @Index(name = "idx_user", columnList = "USERID, CONVERSATIONID")
        }
)
@IdClass(ConversationParticipantId.class)
public class ConversationParticipantVO implements Serializable {

    /**
     * CONVERSATIONID (PK, FK -> sdc_conversation.CONVERSATIONID)
     */
    @Id
    @Column(name = "CONVERSATIONID", nullable = false)
    private Long conversationId;

    /**
     * USERID (PK, FK -> sdu_user.USERID)
     */
    @Id
    @Column(name = "USERID", nullable = false)
    private Integer userId;

    /**
     * ROLE: OWNER, ADMIN, MEMBER (default 'MEMBER')
     */
    @Column(name = "ROLE", length = 20)
    private String role;

    /**
     * 알림 음소거 여부 (default false)
     */
    @Column(name = "MUTED", nullable = false)
    private Boolean muted;

    /**
     * 숨김 여부 (default false)
     */
    @Column(name = "HIDDEN", nullable = false)
    private Boolean hidden;

    /**
     * 참여 일시 (default CURRENT_TIMESTAMP)
     */
    @Column(name = "JOINEDAT", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    /**
     * 마지막 읽음 시각
     */
    @Column(name = "LASTREADAT")
    private LocalDateTime lastReadAt;

    /**
     * 대화 엔티티 참조 (편의용, 쓰기 금지)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONVERSATIONID", insertable = false, updatable = false)
    private ConversationVO conversation;

    @PrePersist
    private void onPrePersist() {
        if (role == null || role.isBlank()) {
            role = "MEMBER";
        }
        if (muted == null) {
            muted = Boolean.FALSE;
        }
        if (hidden == null) {
            hidden = Boolean.FALSE;
        }
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
    }
}
