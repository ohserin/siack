package com.dakgu.siack.workspace.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 워크스페이스 멤버 초대 요청 DTO
 * userId : 초대할 사용자 ID (필수)
 * role   : 부여할 역할 (선택, 기본 MEMBER)
 */
@Getter
@Setter
@NoArgsConstructor
public class InviteWorkspaceMemberRequestDTO {
    private Long userId;
    private String role = "MEMBER";
}

