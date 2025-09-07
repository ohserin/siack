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
    private String username;
    private String title;
    private String content;

}