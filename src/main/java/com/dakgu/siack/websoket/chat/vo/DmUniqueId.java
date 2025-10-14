package com.dakgu.siack.websoket.chat.vo;

import java.io.Serial;
import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * sdc_dm_unique PK (USERID1, USERID2)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class DmUniqueId implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Integer userId1;
    private Integer userId2;
}

