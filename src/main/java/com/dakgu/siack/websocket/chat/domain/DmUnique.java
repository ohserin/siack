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
@Table(name = "sdc_dm_unique")
@IdClass(DmUniqueId.class)
public class DmUnique {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID1", referencedColumnName = "USERID", nullable = false)
    private User user1;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID2", referencedColumnName = "USERID", nullable = false)
    private User user2;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONVERSATIONID", referencedColumnName = "CONVERSATIONID", nullable = false, unique = true)
    private Conversation conversation;

    @Column(name = "CREATEDAT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}

