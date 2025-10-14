package com.dakgu.siack.websoket.chat.vo;

import java.io.Serial;
import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * sdc_pinned_message PK (CONVERSATIONID, MESSAGEID)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PinnedMessageId implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long conversationId;
    private Long messageId;
}

