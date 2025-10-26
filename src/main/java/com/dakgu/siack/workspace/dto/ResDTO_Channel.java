package com.dakgu.siack.workspace.dto;

import lombok.*;

/**
 * 채널 정보를 담는 DTO
 * 활성 채널 리스트 반환 시 사용 (채널 이름, 아이디, 설명)
 */
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResDTO_Channel {
    private Long channelId;
    private String name;
    private String description;
}

