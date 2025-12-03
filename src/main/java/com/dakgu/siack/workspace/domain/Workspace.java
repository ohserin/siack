package com.dakgu.siack.workspace.domain;

import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.utils.Timestamp;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sdw_workspace")
public class Workspace extends Timestamp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "WORKSPACEID")
    private Long workspaceId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "INVITECODE", length = 20, unique = true)
    private String inviteCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OWNERID", nullable = false)
    private User owner;

    @Column(nullable = false)
    private boolean status = true;

    @Column(name = "IMAGEURL", length = 255)
    private String imageUrl;
}
