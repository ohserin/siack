package com.dakgu.siack.workspace.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceUserDTO {
    private String id;
    private String nickname;
    private Long profileImage;
}
