package com.dakgu.siack.remote.service;

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
     * 지정된 경로에 파일 내용을 씁니다.
     *
     * @param path    파일의 전체 경로
     * @param content 파일에 쓸 내용
     */
    void writeFile(String path, String content);
}
