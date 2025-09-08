package com.dakgu.siack.board.dto;

import com.dakgu.siack.utils.ResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardResponseDto extends ResponseDTO {
    private Long boardId;
    private String nickname;
    private String title;
    private String content;
    private java.sql.Timestamp createdat;

    public BoardResponseDto(int statusCode, String message, Long boardId, String nickname, String title, String content, java.sql.Timestamp createdat) {
        super(statusCode, message);
        this.boardId = boardId;
        this.nickname = nickname;
        this.title = title;
        this.content = content;
        this.createdat = createdat;
    }
}