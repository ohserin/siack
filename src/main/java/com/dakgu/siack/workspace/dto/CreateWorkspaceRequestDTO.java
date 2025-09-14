package com.dakgu.siack.workspace.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateWorkspaceRequestDTO {
    private String name;
    private String description;
}