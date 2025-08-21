package com.dakgu.siack.file.controller;

import com.dakgu.siack.file.dto.FileResponse;
import com.dakgu.siack.file.service.FileService;
import com.dakgu.siack.file.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * 파일 업로드, 다운로드 등 파일 관련 API 엔드포인트를 제공하는 컨트롤러입니다.
 */
@Slf4j
@RestController
@RequestMapping("/v1/files") // 엔드포인트 변경
@RequiredArgsConstructor
public class FileController {

    private final FileUploadService fileUploadService;
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
     * 클라이언트로부터 multipart/form-data 형식의 파일을 받아 저장하고, 메타데이터를 DB에 기록합니다.
     *
     * @param file           업로드된 파일 데이터 (MultipartFile)
     * @param authentication JWT 토큰으로부터 파싱된 사용자 인증 정보
     * @return 생성된 파일의 고유 ID(fileId)를 포함한 성공 메시지
     */
    @PostMapping(value = "/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> writeFile(@RequestParam("file") MultipartFile file, Authentication authentication) {
        try {
            Long fileId = fileUploadService.uploadAndSaveMetadata(file, authentication);
            return ResponseEntity.ok("파일 업로드 성공. File ID: " + fileId);

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("파일 업로드 실패");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("파일 업로드 실패");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("파일 처리 중 오류가 발생했습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body("파일 업로드 중 서버 오류가 발생했습니다.");
        }
    }
}
