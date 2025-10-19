package com.dakgu.siack.websocket.chat.domain;

import com.dakgu.siack.file.vo.SdfFile;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sdc_message_attachment")
@IdClass(MessageAttachmentId.class)
public class MessageAttachment {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MESSAGEID", referencedColumnName = "MESSAGEID", nullable = false)
    private Message message;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FILEID", referencedColumnName = "FILEID", nullable = false)
    private SdfFile file;

    @Builder.Default
    @Column(name = "ORDINAL", nullable = false)
    private int ordinal = 0;
}
