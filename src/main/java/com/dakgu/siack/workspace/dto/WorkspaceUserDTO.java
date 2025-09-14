package com.dakgu.siack.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceUserDTO {
    private String id;
    private String nickname;
    private Long profileImage;
}
