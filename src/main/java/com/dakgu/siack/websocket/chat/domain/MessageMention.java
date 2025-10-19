package com.dakgu.siack.websocket.chat.domain;

import com.dakgu.siack.user.vo.User;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sdc_message_mention",
       indexes = {
           @Index(name = "idx_user", columnList = "USERID, MESSAGEID")
       })
@IdClass(MessageMentionId.class)
public class MessageMention {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MESSAGEID", referencedColumnName = "MESSAGEID", nullable = false)
    private Message message;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", referencedColumnName = "USERID", nullable = false)
    private User user;
}
