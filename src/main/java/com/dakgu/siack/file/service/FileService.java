package com.dakgu.siack.file.service;

import com.dakgu.siack.file.dto.FileStorageResult;

/**
 * 물리적인 파일 저장/읽기를 처리하는 서비스에 대한 표준 인터페이스입니다.
 */
public interface FileService {

    /**
     * 지정된 경로의 파일 내용을 읽어옵니다.
     *
     * @param path 파일의 전체 경로
     * @return 파일 내용 (Base64 인코딩된 문자열)
     */
    String readFile(String path);

    /**
     * 파일 바이트 배열과 확장자를 받아 물리 스토리지에 파일을 저장하고, 그 결과를 반환합니다.
     *
     * @param content   파일의 실제 바이트 데이터
     * @param extension 파일 확장자
     * @return 파일 저장 결과를 담은 DTO
     */
    FileStorageResult writeFile(byte[] content, String extension);
}
