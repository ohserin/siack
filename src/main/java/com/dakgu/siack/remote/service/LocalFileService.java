package com.dakgu.siack.remote.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * 로컬 파일 시스템의 파일을 직접 읽고 쓰는 서비스 구현체입니다.
 * `file.access.mode` 속성이 `local`이거나 정의되지 않았을 때 활성화됩니다.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "file.access.mode", havingValue = "local", matchIfMissing = true)
public class LocalFileService implements FileService {

    public LocalFileService() {
        log.info("LocalFileService가 활성화되었습니다. 로컬 파일 시스템에 직접 접근합니다.");
    }

    /**
     * 로컬 파일 시스템에서 파일 내용을 읽어옵니다.
     *
     * @param path 읽어올 파일의 전체 경로
     * @return 파일 내용
     * @throws RuntimeException 파일 읽기 중 오류 발생 시
     */
    @Override
    public String readFile(String path) {
        try {
            log.info("로컬 파일 읽기 시도: {}", path);
            String content = Files.readString(Paths.get(path), StandardCharsets.UTF_8);
            log.info("로컬 파일 읽기 성공: {}", path);
            return content;
        } catch (IOException e) {
            log.error("로컬 파일 읽기 실패: path={}, error={}", path, e.getMessage(), e);
            throw new RuntimeException("로컬 파일 읽기에 실패했습니다. 경로: " + path, e);
        }
    }

    /**
     * 로컬 파일 시스템에 파일 내용을 씁니다.
     *
     * @param path    파일의 전체 경로
     * @param content 파일에 쓸 내용
     * @throws RuntimeException 파일 쓰기 중 오류 발생 시
     */
    @Override
    public void writeFile(String path, String content) {
        try {
            log.info("로컬 파일 쓰기 시도: {}", path);
            Files.writeString(Paths.get(path), content, StandardCharsets.UTF_8);
            log.info("로컬 파일 쓰기 성공: {}", path);
        } catch (IOException e) {
            log.error("로컬 파일 쓰기 실패: path={}, error={}", path, e.getMessage(), e);
            throw new RuntimeException("로컬 파일 쓰기에 실패했습니다. 경로: " + path, e);
        }
    }
}
