package com.dakgu.siack.workspace.domain;

import com.dakgu.siack.user.vo.User;
import jakarta.persistence.*;
import lombok.*;

@Builder
@Entity
@Table(name = "sdw_channel_member")
@IdClass(ChannelMemberId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChannelMember {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CHANNELID", nullable = false)
    private Channel channel;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", nullable = false)
    private User user;

    @Column(name = "ROLE", nullable = false, length = 50)
    private String role = "MEMBER";

    @Column(name = "STATUS", nullable = false)
    private boolean status = true;
}
