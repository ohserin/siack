package com.dakgu.siack.websocket.chat.domain;

import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.utils.Timestamp;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sdc_message",
       indexes = {
           @Index(name = "idx_conv_time", columnList = "CONVERSATIONID, CREATEDAT"),
           @Index(name = "idx_parent", columnList = "PARENTMSGID"),
           @Index(name = "idx_sender_time", columnList = "SENDERID, CREATEDAT")
       })
public class Message extends Timestamp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MESSAGEID")
    private Long messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONVERSATIONID", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SENDERID", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARENTMSGID")
    private Message parentMessage;

    @Lob
    @Column(name = "CONTENT")
    private String content;

    @Builder.Default
    @Column(name = "CONTENTTYPE", length = 30, nullable = false)
    private String contentType = "text/plain";

    @Column(name = "METADATA", columnDefinition = "json")
    private String metadata;

    @Builder.Default
    @Column(name = "ISDELETED", nullable = false)
    private boolean isDeleted = false;

    @Builder.Default
    @Column(name = "ISEDITED", nullable = false)
    private boolean isEdited = false;
}
