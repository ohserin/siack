package com.dakgu.siack.websocket.chat.domain;

import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.utils.Timestamp;
import com.dakgu.siack.workspace.vo.ChannelVO;
import com.dakgu.siack.workspace.vo.WorkspaceVO;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sdc_conversation",
       indexes = {
           @Index(name = "idx_ws_type", columnList = "WORKSPACEID, TYPE"),
           @Index(name = "idx_channel", columnList = "CHANNELID")
       })
public class Conversation extends Timestamp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CONVERSATIONID")
    private Long conversationId;

    @Enumerated(EnumType.ORDINAL)
    @Column(name = "TYPE", nullable = false)
    private ConversationType type; // 0:CHANNEL, 1:DM, 2:GROUP_DM

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WORKSPACEID", nullable = false)
    private WorkspaceVO workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CHANNELID")
    private ChannelVO channel; // TYPE=0일 때만 사용

    @Column(name = "TITLE", length = 255)
    private String title; // 그룹 DM 제목 등

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CREATEDBY", nullable = false)
    private User createdBy;
}

