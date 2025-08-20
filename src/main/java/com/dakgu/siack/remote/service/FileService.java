package com.dakgu.siack.remote.service;

import com.dakgu.siack.remote.dto.FileRequest;

/**
 * 파일 제어 서비스에 대한 표준 인터페이스입니다.
 * 환경에 따라 LocalFileService 또는 SshFileService 구현체가 주입될 수 있습니다.
 */
public interface FileService {

    /**
     * 지정된 경로의 파일 내용을 읽어옵니다.
     *
     * @param path 파일의 전체 경로
     * @return 파일 내용
     */
    String readFile(String path);

    /**
     * 요청 데이터를 기반으로 파일 내용을 쓰고, 생성된 파일명을 반환합니다.
     *
     * @param request 파일명, 확장자, 내용을 담은 요청 객체
     * @return 서버에 저장된 고유한 파일명 (예: a-b-c-d.jpg)
     */
    String writeFile(FileRequest request);
}
