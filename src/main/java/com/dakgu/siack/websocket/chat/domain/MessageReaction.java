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
@Table(name = "sdc_message_reaction",
       indexes = {
           @Index(name = "idx_msg", columnList = "MESSAGEID")
       })
@IdClass(MessageReactionId.class)
public class MessageReaction {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MESSAGEID", referencedColumnName = "MESSAGEID", nullable = false)
    private Message message;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", referencedColumnName = "USERID", nullable = false)
    private User user;

    @Id
    @Column(name = "EMOJI", length = 64, nullable = false)
    private String emoji;

    @Column(name = "CREATEDAT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
