package com.dakgu.siack.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FileStorageResult {

    private final String storedName; // 서버에 저장된 고유한 파일명 (e.g., uuid.jpg)
    private final String fullPath;   // 파일이 저장된 전체 경로
    private final String category;   // 파일이 속한 카테고리 (e.g., images)
    private final String extension;  // 파일 확장자

}
