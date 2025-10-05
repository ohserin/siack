package com.dakgu.siack.workspace.vo;

import com.dakgu.siack.user.vo.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sdw_workspace_member")
@IdClass(WorkspaceMemberId.class)
public class WorkspaceMemberVO {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WORKSPACEID", referencedColumnName = "WORKSPACEID")
    private WorkspaceVO workspace;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", referencedColumnName = "USERID")
    private User user;

    @Column(name = "ROLE", length = 50)
    private String role = "MEMBER";

    @Column(name = "JOINEDAT")
    private LocalDateTime joinedAt;

    @Column(name = "STATUS")
    private boolean status = true;

    @Column(name = "BANYN")
    private boolean banyn = false;

    @PrePersist
    public void prePersist() {
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
    }
}
