package com.dakgu.siack.websoket.chat.vo;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 1:1 DM 유니크 매핑 VO - sdc_dm_unique
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = {"userId1", "userId2"})
@Entity
@Table(
        name = "sdc_dm_unique",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_conv", columnNames = {"CONVERSATIONID"})
        }
)
@IdClass(DmUniqueId.class)
public class DmUniqueVO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * USERID1 (PK, FK -> sdu_user.USERID)
     */
    @Id
    @Column(name = "USERID1", nullable = false)
    private Integer userId1;

    /**
     * USERID2 (PK, FK -> sdu_user.USERID)
     */
    @Id
    @Column(name = "USERID2", nullable = false)
    private Integer userId2;

    /**
     * CONVERSATIONID (FK -> sdc_conversation.CONVERSATIONID)
     */
    @Column(name = "CONVERSATIONID", nullable = false)
    private Long conversationId;

    /**
     * CREATEDAT (default CURRENT_TIMESTAMP)
     */
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 대화 엔티티 참조 (읽기 전용)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONVERSATIONID", insertable = false, updatable = false)
    private ConversationVO conversation;

    @PrePersist
    private void onPrePersist() {
        if (userId1 != null && userId2 != null && userId1 > userId2) {
            int tmp = userId1;
            userId1 = userId2;
            userId2 = tmp;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    private void onPreUpdate() {
        if (userId1 != null && userId2 != null && userId1 > userId2) {
            int tmp = userId1;
            userId1 = userId2;
            userId2 = tmp;
        }
    }
}

