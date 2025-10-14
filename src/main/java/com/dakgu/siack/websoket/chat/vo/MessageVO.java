package com.dakgu.siack.websoket.chat.vo;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.io.Serial;

/**
 * 메시지 VO - sdc_message
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = {"messageId"})
@Entity
@Table(
        name = "sdc_message",
        indexes = {
                @Index(name = "idx_conv_time", columnList = "CONVERSATIONID, CREATEDAT"),
                @Index(name = "idx_parent", columnList = "PARENTMSGID"),
                @Index(name = "idx_sender_time", columnList = "SENDERID, CREATEDAT")
        }
)
public class MessageVO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * MESSAGEID (PK, AUTO_INCREMENT)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MESSAGEID")
    private Long messageId;

    /**
     * CONVERSATIONID (FK -> sdc_conversation.CONVERSATIONID)
     */
    @Column(name = "CONVERSATIONID", nullable = false)
    private Long conversationId;

    /**
     * SENDERID (FK -> sdu_user.USERID)
     */
    @Column(name = "SENDERID", nullable = false)
    private Integer senderId;

    /**
     * PARENTMSGID (self FK -> sdc_message.MESSAGEID)
     */
    @Column(name = "PARENTMSGID")
    private Long parentMsgId;

    /**
     * CONTENT (TEXT)
     */
    @Column(name = "CONTENT", columnDefinition = "text")
    private String content;

    /**
     * CONTENTTYPE (varchar(30), default 'text/plain')
     */
    @Column(name = "CONTENTTYPE", length = 30, nullable = false)
    private String contentType;

    /**
     * METADATA (JSON)
     */
    @Column(name = "METADATA", columnDefinition = "json")
    private String metadata;

    /**
     * 삭제 여부 (default false)
     */
    @Column(name = "ISDELETED", nullable = false)
    private Boolean deleted;

    /**
     * 편집 여부 (default false)
     */
    @Column(name = "ISEDITED", nullable = false)
    private Boolean edited;

    /**
     * 생성 일시 (default CURRENT_TIMESTAMP)
     */
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정 일시 (default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
     */
    @Column(name = "UPDATEDAT", nullable = false)
    private LocalDateTime updatedAt;

    /** 대화 엔티티 참조 (읽기 전용) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONVERSATIONID", insertable = false, updatable = false)
    private ConversationVO conversation;

    /**
     * 부모 메시지 참조 (읽기 전용)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARENTMSGID", insertable = false, updatable = false)
    private MessageVO parentMessage;

    @PrePersist
    private void onPrePersist() {
        if (contentType == null || contentType.isBlank()) {
            contentType = "text/plain";
        }
        if (deleted == null) {
            deleted = Boolean.FALSE;
        }
        if (edited == null) {
            edited = Boolean.FALSE;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = createdAt;
        }
    }

    @PreUpdate
    private void onPreUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
