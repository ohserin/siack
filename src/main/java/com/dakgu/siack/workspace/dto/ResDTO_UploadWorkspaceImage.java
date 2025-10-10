package com.dakgu.siack.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResDTO_UploadWorkspaceImage {
    private int statusCode;
    private String message;
    private String url;
}

