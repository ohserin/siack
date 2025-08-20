package com.dakgu.siack.remote.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 파일 쓰기 요청 시 클라이언트로부터 받을 데이터를 담는 DTO입니다.
 */
@Getter
@Setter
public class FileRequest {

    private String filename; // 파일 이름 (확장자 제외)
    private String extension; // 파일 확장자
    private String content; // 파일에 쓸 내용 (Base64 인코딩된 문자열)

}
