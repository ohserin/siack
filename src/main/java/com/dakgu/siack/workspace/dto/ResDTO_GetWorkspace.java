package com.dakgu.siack.workspace.dto;

import com.dakgu.siack.utils.ResponseDTO;
import lombok.*;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResDTO_GetWorkspace extends ResponseDTO {
    private Long workspaceId;
    private String name;
    private String description;
    private Long ownerId;
    private List<ResDTO_WorkspaceUser> users;
}
