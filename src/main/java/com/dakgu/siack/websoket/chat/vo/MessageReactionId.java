package com.dakgu.siack.websoket.chat.vo;

import java.io.Serial;
import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * sdc_message_reaction PK (MESSAGEID, USERID, EMOJI)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class MessageReactionId implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long messageId;
    private Integer userId;
    private String emoji;
}

