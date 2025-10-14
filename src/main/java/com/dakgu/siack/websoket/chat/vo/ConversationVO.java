package com.dakgu.siack.websoket.chat.vo;

import com.dakgu.siack.utils.Timestamp;
import lombok.*;
import jakarta.persistence.*;

import java.io.Serializable;

/**
 * 대화(채널/DM/그룹DM) VO
 */
@Builder
@Entity
@Table(name = "sdc_conversation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationVO extends Timestamp implements Serializable {
    /**
     * 대화 PK
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CONVERSATIONID")
    private Long conversationId;

    /**
     * 0:CHANNEL, 1:DM, 2:GROUP_DM
     */
    @Column(name = "TYPE", nullable = false)
    private Integer type;

    /**
     * 워크스페이스 (채널/DM 모두 소속)
     */
    @Column(name = "WORKSPACEID", nullable = false)
    private Long workspaceId;

    /**
     * TYPE=0일 때 sdw_channel.CHANNELID
     */
    @Column(name = "CHANNELID")
    private Long channelId;

    /**
     * 그룹 DM 제목 등
     */
    @Column(name = "TITLE")
    private String title;

    /**
     * 생성자
     */
    @Column(name = "CREATEDBY", nullable = false)
    private Integer createdBy;
}
