package com.dakgu.siack.workspace.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 워크스페이스 멤버 초대 요청 DTO
 * nickname : 초대할 사용자 닉네임 (필수, 고유)
 * role     : 부여할 역할 (선택, 기본 MEMBER)
 */
@Getter
@Setter
@NoArgsConstructor
public class InviteWorkspaceMemberRequestDTO {
    private String nickname;
    private String role = "MEMBER";
}
