package com.dakgu.siack.workspace.vo;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChannelMemberIdVO implements Serializable {
    private Long channel;
    private Long user;
}