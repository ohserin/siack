package com.dakgu.siack.websoket.chat.vo;

import java.io.Serial;
import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * sdc_conversation_participant PK (CONVERSATIONID, USERID)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ConversationParticipantId implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    private Long conversationId;
    private Integer userId;
}
