package com.dakgu.siack.workspace.dto;

import com.dakgu.siack.utils.ResponseDTO;
import lombok.*;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResDTO_WorkspaceInfo extends ResponseDTO {
    private Long workspaceId;
    private String workspaceName;
    private String workspaceDesc;
    private String createDate;
    private String workspaceImage;
    private String ownerName;
    private String userRole;
    private String planName = "Free"; // 미구현
    private double usedStorage = 0.0; // 미구현
    private int memberCount;
    private int channelCount;
    private String inviteCode;

    // 워크스페이스 참여 유저 리스트
    private List<ResDTO_WorkspaceUser> users;
}
