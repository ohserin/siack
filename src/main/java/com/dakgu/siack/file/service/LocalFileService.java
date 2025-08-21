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
import java.util.Base64;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "file.access.mode", havingValue = "local", matchIfMissing = true)
public class LocalFileService implements FileService {

    private final String uploadPath;
    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png");

    public LocalFileService(@Value("${file.local.upload-path:uploads}") String uploadPath) {
        this.uploadPath = uploadPath;
        log.info("LocalFileService가 활성화되었습니다. 로컬 파일 시스템에 직접 접근합니다. Upload Path: {}", uploadPath);
    }

    @Override
    public String readFile(String path) {
        try {
            byte[] fileBytes = Files.readAllBytes(Paths.get(path));
            return Base64.getEncoder().encodeToString(fileBytes);
        } catch (IOException e) {
            log.error("로컬 파일 읽기 실패: path={}, error={}", path, e.getMessage(), e);
            throw new RuntimeException("로컬 파일 읽기에 실패했습니다. 경로: " + path, e);
        }
    }

    @Override
    public FileStorageResult writeFile(byte[] content, String extension) {
        String lowercasedExtension = (extension != null) ? extension.toLowerCase() : "";
        String category = getFileCategory(lowercasedExtension);

        String uuid = UUID.randomUUID().toString();
        String newFilename = uuid + "." + lowercasedExtension;
        Path directoryPath = Paths.get(uploadPath, category);
        Path finalPath = directoryPath.resolve(newFilename);

        try {
            Files.createDirectories(directoryPath);
            Files.write(finalPath, content);

            log.info("로컬 파일 쓰기 성공: {}", finalPath);
            return new FileStorageResult(newFilename, finalPath.toString(), category, lowercasedExtension);

        } catch (IOException e) {
            log.error("로컬 파일 쓰기 실패: path={}, error={}", finalPath, e.getMessage(), e);
            throw new RuntimeException("로컬 파일 쓰기에 실패했습니다. 경로: " + finalPath, e);
        }
    }

    private String getFileCategory(String extension) {
        if (IMAGE_EXTENSIONS.contains(extension)) {
            return "images";
        }
        throw new IllegalArgumentException("지원하지 않는 파일 형식입니다: " + extension);
    }
}
