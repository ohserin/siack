package com.dakgu.siack.file.service;

import com.dakgu.siack.file.dto.FileStorageResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

/*
    도커로 서버를 구동하여 사용하지 않는 클래스입니다.
 */

@Slf4j
@Service
@ConditionalOnProperty(name = "file.access.mode", havingValue = "local", matchIfMissing = true)
public class LocalFileService implements FileService {

    private final String uploadPath;
    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png");

    public LocalFileService(@Value("${file.local.upload-path:uploads}") String uploadPath) {
        this.uploadPath = uploadPath;
    }

    @Override
    public byte[] readFile(String path) {
        try {
            return Files.readAllBytes(Paths.get(path));
        } catch (IOException e) {
            log.error("로컬 파일 읽기 실패: path={}, error={}", path, e.getMessage(), e);
            throw new RuntimeException("로컬 파일 읽기에 실패했습니다. 경로: " + path, e);
        }
    }

    @Override
    public FileStorageResult writeFile(byte[] content, String extension) {
        String uuid = UUID.randomUUID().toString();
        String lowercasedExtension = (extension != null && !extension.isBlank()) ? extension.toLowerCase() : "bin";
        String newFilename = uuid + "." + lowercasedExtension;
        String yearMonth = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy/MM"));
        Path directoryPath = Paths.get(uploadPath, yearMonth);
        Path finalPath = directoryPath.resolve(newFilename);

        try {
            Files.createDirectories(directoryPath);
            Files.write(finalPath, content);
            log.info("로컬 파일 쓰기 성공: {}", finalPath);
            return new FileStorageResult(newFilename, finalPath.toString(), null, lowercasedExtension);
        } catch (IOException e) {
            log.error("로컬 파일 쓰기 실패: path={}, error={}", finalPath, e.getMessage(), e);
            throw new RuntimeException("로컬 파일 쓰기에 실패했습니다. 경로: " + finalPath, e);
        }
    }

    private String getFileCategory(String extension) {
        if (IMAGE_EXTENSIONS.contains(extension)) return "images";
        throw new IllegalArgumentException("지원하지 않는 파일 형식입니다: " + extension);
    }

    /**
     * 파일명에서 확장자를 추출합니다.
     * @param filename 원본 파일명
     * @return 확장자 (없으면 빈 문자열)
     */
    private String getExtension(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf('.');
        return (idx > 0 && idx < filename.length() - 1) ? filename.substring(idx + 1).toLowerCase() : "";
    }
}
