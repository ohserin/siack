package com.dakgu.siack.workspace.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class CreateWorkspaceRequestDTO {
    private String name;
    private String description;
}