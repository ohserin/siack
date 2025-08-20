package com.dakgu.siack.remote.controller;

import com.dakgu.siack.remote.dto.FileRequest;
import com.dakgu.siack.remote.dto.FileResponse;
import com.dakgu.siack.remote.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 원격 또는 로컬 서버의 파일을 제어하는 API 엔드포인트를 제공하는 컨트롤러입니다.
 * 실제 파일 제어 로직은 주입된 FileService 구현체에 의해 결정됩니다.
 */
@RestController
@RequestMapping("/api/remote/files")
@RequiredArgsConstructor
public class RemoteFileController {

    // 특정 구현체가 아닌 FileService 인터페이스에 의존합니다.
    // Spring이 설정에 맞는 구현체(Local 또는 Ssh)를 자동으로 주입합니다.
    private final FileService fileService;

    /**
     * 지정된 경로의 파일 내용을 읽어옵니다.
     *
     * @param path 읽어올 파일의 전체 경로 (URL 쿼리 파라미터)
     * @return 파일 내용을 담은 응답 객체
     */
    @GetMapping("/read")
    public ResponseEntity<FileResponse> readFile(@RequestParam String path) {
        try {
            String content = fileService.readFile(path);
            return ResponseEntity.ok(new FileResponse(content));
        } catch (RuntimeException e) {
            // 서비스 계층에서 발생한 예외를 클라이언트에 전달합니다.
            return ResponseEntity.internalServerError().body(new FileResponse(e.getMessage()));
        }
    }

    /**
     * 지정된 경로에 파일 내용을 씁니다.
     *
     * @param request 파일 경로와 내용을 담은 요청 객체
     * @return 작업 성공 여부 메시지를 담은 응답 객체
     */
    @PostMapping("/write")
    public ResponseEntity<String> writeFile(@RequestBody FileRequest request) {
        try {
            fileService.writeFile(request.getPath(), request.getContent());
            return ResponseEntity.ok("파일 쓰기 성공: " + request.getPath());
        } catch (RuntimeException e) {
            // 서비스 계층에서 발생한 예외를 클라이언트에 전달합니다.
            return ResponseEntity.internalServerError().body("파일 쓰기 실패: " + e.getMessage());
        }
    }
}
