package com.dakgu.siack.board.controller;

import com.dakgu.siack.board.dto.BoardRequestDTO;
import com.dakgu.siack.board.service.BoardService;
import com.dakgu.siack.utils.ResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RequiredArgsConstructor
@RequestMapping
@RestController
public class BoardRestController {


    private final BoardService boardService;
    @PostMapping("/board-write")
    public ResponseEntity<ResponseDTO> write(@RequestBody BoardRequestDTO boardDto) {
        try {
            boolean isSuccess = boardService.createBoard(boardDto);
            if (!isSuccess) {
                return ResponseEntity
                        .badRequest()
                        .body(new ResponseDTO(400, "유효하지 않은 사용자입니다."));
            }

            return ResponseEntity
                    .ok(new ResponseDTO(201, "게시물이 성공적으로 작성되었습니다."));

        } catch (Exception e) {
            return ResponseEntity
                    .status(500)
                    .body(new ResponseDTO(500, "게시물 작성 중 오류가 발생했습니다."));
        }
    }

}
