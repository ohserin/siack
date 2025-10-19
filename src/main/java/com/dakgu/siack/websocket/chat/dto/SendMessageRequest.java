package com.dakgu.siack.websocket.chat.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true) // 알 수 없는 필드 무시
public class SendMessageRequest {

    /** 클라이언트 멱등키(UUID). 동일 값 재전송 시 서버는 중복 저장 방지 */
    @org.hibernate.validator.constraints.UUID
    private String clientMessageId;

    /** 스레드 부모 메시지 (없으면 null) → sdc_message.PARENTMSGID */
    private Long parentMessageId;

    /** 본문 (첨부만 보낼 땐 null 허용) → sdc_message.CONTENT */
    @Size(max = 20000)
    private String content;

    /** MIME 형태 → sdc_message.CONTENTTYPE */
    @NotBlank
    @Pattern(regexp = "^(text/plain|text/markdown|application/json)$")
    @Builder.Default
    private String contentType = "text/plain";

    /** 인라인/인용 등 메타 → sdc_message.METADATA(JSON) */
    @Builder.Default
    private Map<String, Object> metadata = Map.of();

    /** 멘션 대상 → sdc_message_mention */
    @Builder.Default
    private List<Integer> mentionUserIds = List.of();

    /** 첨부파일 매핑 → sdc_message_attachment */
    @Size(max = 10)
    @Valid // 중첩 밸리데이션
    @Builder.Default
    private List<AttachmentRef> attachments = List.of();

    /** 무음 전송 등 UX 옵션 (서버 저장 X, 처리 정책용) */
    @Valid
    private ClientOptions clientOptions;

    // --- nested types ---

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttachmentRef {
        @NotNull private Long fileId;
        @Min(0)  @Builder.Default private Integer ordinal = 0;
        @Size(max = 255) private String altText;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClientOptions {
        private Boolean silent;     // 알림 억제
        private Boolean compress;   // 전송 전 압축(클라 힌트)
    }
}