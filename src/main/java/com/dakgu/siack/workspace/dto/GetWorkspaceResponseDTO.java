package com.dakgu.siack.workspace.dto;

import com.dakgu.siack.utils.ResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GetWorkspaceResponseDTO extends ResponseDTO {
    private Long workspaceId;
    private String name;
    private String description;
    private Long ownerId;
    private List<WorkspaceUserDTO> users;
}
