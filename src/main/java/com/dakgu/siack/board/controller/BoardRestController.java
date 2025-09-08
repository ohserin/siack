package com.dakgu.siack.board.controller;

import com.dakgu.siack.board.dto.BoardListResponseDTO;
import com.dakgu.siack.board.dto.BoardRequestDTO;
import com.dakgu.siack.board.service.BoardService;
import com.dakgu.siack.utils.ResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RequestMapping("/v1/board")
@RestController
public class BoardRestController {

    private final BoardService boardService;

    @GetMapping("/list")
    public BoardListResponseDTO getBoardList(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return boardService.getBoardsPaged(page, size);
    }

    @PostMapping("/write")
    public ResponseEntity<?> write(Authentication authentication, @RequestBody BoardRequestDTO boardDto) {
        ResponseDTO response = boardService.createBoard(authentication, boardDto);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

}
