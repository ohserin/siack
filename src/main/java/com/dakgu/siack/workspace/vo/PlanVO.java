package com.dakgu.siack.workspace.vo;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PlanVO {
    private Integer planId; // 플랜 ID
    private String name; // 플랜 이름
    private String description; // 플랜 설명
    private Integer maxMembers; // 최대 멤버 수 제한
    private BigDecimal price; // 월 요금
    private LocalDateTime createdAt; // 생성 시각
}

