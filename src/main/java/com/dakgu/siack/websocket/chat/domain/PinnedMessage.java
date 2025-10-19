package com.dakgu.siack.websocket.chat.domain;

import com.dakgu.siack.user.vo.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sdc_pinned_message")
@IdClass(PinnedMessageId.class)
public class PinnedMessage {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONVERSATIONID", referencedColumnName = "CONVERSATIONID", nullable = false)
    private Conversation conversation;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MESSAGEID", referencedColumnName = "MESSAGEID", nullable = false)
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PINNEDBY", referencedColumnName = "USERID", nullable = false)
    private User pinnedBy;

    @Column(name = "PINNEDAT", nullable = false)
    private LocalDateTime pinnedAt;

    @PrePersist
    public void prePersist() {
        if (pinnedAt == null) pinnedAt = LocalDateTime.now();
    }
}

