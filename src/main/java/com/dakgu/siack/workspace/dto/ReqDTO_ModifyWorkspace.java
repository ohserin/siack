package com.dakgu.siack.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReqDTO_ModifyWorkspace {
    private Long workspaceId;
    private String name;
    private String description;
}

