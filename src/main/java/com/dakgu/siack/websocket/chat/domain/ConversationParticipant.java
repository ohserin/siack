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
@Table(name = "sdc_conversation_participant",
       indexes = {
           @Index(name = "idx_user", columnList = "USERID, CONVERSATIONID")
       })
@IdClass(ConversationParticipantId.class)
public class ConversationParticipant {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONVERSATIONID", referencedColumnName = "CONVERSATIONID", nullable = false)
    private Conversation conversation;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", referencedColumnName = "USERID", nullable = false)
    private User user;

    @Column(name = "ROLE", length = 20)
    private String role = "MEMBER"; // OWNER, ADMIN, MEMBER

    @Column(name = "MUTED")
    private boolean muted = false;

    @Column(name = "HIDDEN")
    private boolean hidden = false;

    @Column(name = "JOINEDAT", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "LASTREADAT")
    private LocalDateTime lastReadAt;

    @PrePersist
    public void prePersist() {
        if (joinedAt == null) joinedAt = LocalDateTime.now();
    }
}

