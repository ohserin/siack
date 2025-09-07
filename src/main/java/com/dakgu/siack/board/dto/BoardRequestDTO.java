package com.dakgu.siack.board.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardRequestDTO {

    private long boardId;
    private String author;
    private  String title;
    private  String content;
    private String username;
}
