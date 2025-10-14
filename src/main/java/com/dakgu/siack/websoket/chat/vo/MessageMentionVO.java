package com.dakgu.siack.websoket.chat.vo;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

/**
 * 멘션 VO - sdc_message_mention
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = {"messageId", "userId"})
@Entity
@Table(
        name = "sdc_message_mention",
        indexes = {
                @Index(name = "idx_user", columnList = "USERID, MESSAGEID")
        }
)
@IdClass(MessageMentionId.class)
public class MessageMentionVO implements Serializable {
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
     * 메시지 엔티티 참조 (읽기 전용)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MESSAGEID", insertable = false, updatable = false)
    private MessageVO message;
}

