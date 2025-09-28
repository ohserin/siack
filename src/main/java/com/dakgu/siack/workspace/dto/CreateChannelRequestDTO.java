package com.dakgu.siack.workspace.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 채널 생성 요청 DTO
 * name        : 채널 이름 (필수)
 * description : 채널 설명 (선택)
 * isPrivate   : 비공개 여부 (기본 false)
 */
@Getter
@Setter
@NoArgsConstructor
public class CreateChannelRequestDTO {
    private String name;
    private String description;
    private boolean isPrivate = false;
}

