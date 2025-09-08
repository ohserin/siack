package com.dakgu.siack.board.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BoardListResponseDTO {
    private List<BoardResponseDto> content;
    private long totalCount;
}
