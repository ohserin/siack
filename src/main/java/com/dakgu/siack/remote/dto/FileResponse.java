package com.dakgu.siack.remote.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * 파일 읽기 요청에 대한 응답으로 클라이언트에 보낼 데이터를 담는 DTO입니다.
 */
@Getter
@Setter
@AllArgsConstructor
public class FileResponse {

    // 원격 서버에서 읽어온 파일의 내용
    private String content;

}
