package com.dakgu.siack.board.entity;

import com.dakgu.siack.board.dto.BoardRequestDTO;
import com.dakgu.siack.utils.Timestamp;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sdu_board")
public class Board extends Timestamp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long boardId;
    private long author;
    private String title;
    private String content;

    public Board(Long userCode, BoardRequestDTO boardDto) {
        this.author = userCode;
        this.title = boardDto.getTitle();
        this.content = boardDto.getContent();
    }


}
