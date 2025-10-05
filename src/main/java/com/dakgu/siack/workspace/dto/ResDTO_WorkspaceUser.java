package com.dakgu.siack.workspace.dto;

import lombok.*;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResDTO_WorkspaceUser {
    private String id;
    private String nickname;
    private Long profileImage;
}
