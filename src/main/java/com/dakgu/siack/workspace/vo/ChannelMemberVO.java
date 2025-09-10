package com.dakgu.siack.workspace.vo;

import com.dakgu.siack.user.vo.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sdw_channel_member")
@IdClass(ChannelMemberIdVO.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChannelMemberVO {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CHANNELID", nullable = false)
    private ChannelVO channel;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", nullable = false)
    private User user;

    @Column(name = "ROLE", nullable = false, length = 50)
    private String role = "MEMBER";

    @Column(name = "STATUS", nullable = false)
    private boolean status = true;
}

