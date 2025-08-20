package com.dakgu.siack.remote.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 파일 쓰기 요청 시 클라이언트로부터 받을 데이터를 담는 DTO입니다.
 */
@Getter
@Setter
public class FileRequest {

    private String path; // 파일을 쓸 원격 서버의 절대 경로
    private String content; // 파일에 쓸 내용

}
