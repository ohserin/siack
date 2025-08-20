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

    private final FileService fileService;

    @GetMapping("/read")
    public ResponseEntity<FileResponse> readFile(@RequestParam String path) {
        try {
            String content = fileService.readFile(path);
            return ResponseEntity.ok(new FileResponse(content));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(new FileResponse(e.getMessage()));
        }
    }

    /**
     * 클라이언트로부터 받은 파일 정보를 이용해 파일을 저장하고, 생성된 파일명을 반환합니다.
     *
     * @param request 파일 확장자와 Base64 인코딩된 내용을 담은 요청 객체
     * @return 생성된 고유 파일명을 포함한 성공 메시지
     */
    @PostMapping("/write")
    public ResponseEntity<String> writeFile(@RequestBody FileRequest request) {
        try {
            String newFilename = fileService.writeFile(request);
            return ResponseEntity.ok("파일 업로드 성공");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("파일 업로드 실패");
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body("파일 업로드 실패");
        }
    }
}
