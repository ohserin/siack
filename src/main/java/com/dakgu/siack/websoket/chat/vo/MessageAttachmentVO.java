package com.dakgu.siack.websoket.chat.vo;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

/**
 * 메시지 첨부파일 VO - sdc_message_attachment
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = {"messageId", "fileId"})
@Entity
@Table(name = "sdc_message_attachment")
@IdClass(MessageAttachmentId.class)
public class MessageAttachmentVO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * MESSAGEID (PK, FK -> sdc_message.MESSAGEID)
     */
    @Id
    @Column(name = "MESSAGEID", nullable = false)
    private Long messageId;

    /**
     * FILEID (PK, FK -> sdf_file.FILEID)
     */
    @Id
    @Column(name = "FILEID", nullable = false)
    private Long fileId;

    /**
     * 첨부 순서 (default 0)
     */
    @Column(name = "ORDINAL", nullable = false)
    private Integer ordinal;

    /**
     * 메시지 엔티티 참조 (읽기 전용)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MESSAGEID", insertable = false, updatable = false)
    private MessageVO message;

    @PrePersist
    private void onPrePersist() {
        if (ordinal == null) {
            ordinal = 0;
        }
    }
}

