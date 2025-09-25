package com.dakgu.siack.workspace.vo;

import com.dakgu.siack.utils.Timestamp;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sdw_channel")
public class ChannelVO extends Timestamp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CHANNELID")
    private Long channelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WORKSPACEID", nullable = false)
    private WorkspaceVO workspace;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "ISPRIVATE", nullable = false)
    private boolean isPrivate = false;

    @Column(nullable = false)
    private boolean status = true;
}
