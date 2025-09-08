package com.dakgu.siack.board.dto;

import com.dakgu.siack.board.vo.Board;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BoardListResponseDTO {
    private List<Board> content;
    private long totalCount;
}

