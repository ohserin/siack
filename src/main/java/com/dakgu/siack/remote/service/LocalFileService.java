package com.dakgu.siack.remote.service;

import com.dakgu.siack.remote.dto.FileRequest;
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

/**
 * 로컬 파일 시스템의 파일을 직접 읽고 쓰는 서비스 구현체입니다.
 * `file.access.mode` 속성이 `local`이거나 정의되지 않았을 때 활성화됩니다.
 */
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
            throw new RuntimeException("로컬 파일 읽기에 실패했습니다. 경로: " + path);
        }
    }

    @Override
    public String writeFile(FileRequest request) {
        String extension = request.getExtension().toLowerCase();
        String category = getFileCategory(extension);

        String uuid = UUID.randomUUID().toString();
        String newFilename = uuid + "." + extension;
        Path directoryPath = Paths.get(uploadPath, category);
        Path finalPath = directoryPath.resolve(newFilename);

        try {
            Files.createDirectories(directoryPath);

            byte[] fileContent = Base64.getDecoder().decode(request.getContent());
            Files.write(finalPath, fileContent);

            return newFilename;

        } catch (IOException e) {
            throw new RuntimeException("로컬 파일 쓰기에 실패했습니다. 경로: " + finalPath);
        }
    }

    private String getFileCategory(String extension) {
        if (IMAGE_EXTENSIONS.contains(extension)) return "images";
        throw new IllegalArgumentException("지원하지 않는 파일 형식입니다: " + extension);
    }

}
