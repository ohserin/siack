package com.dakgu.siack.board.vo;

import com.dakgu.siack.board.dto.BoardRequestDTO;
import com.dakgu.siack.utils.Timestamp;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sdu_board")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Board extends Timestamp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BOARDID")
    private Long boardId;

    @Column(name = "AUTHOR", nullable = false)
    private Long userId;   // author → userId 로 이름 변경 (더 직관적)

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "CONTENT", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "ISDELETED", nullable = false)
    private Integer isDeleted = 0;

    public Board(Long userId, BoardRequestDTO dto) {
        this.userId = userId;
        this.title = dto.getTitle();
        this.content = dto.getContent();
    }
}