package com.dakgu.siack.board.service;

import com.dakgu.siack.board.dto.BoardRequestDTO;
import com.dakgu.siack.board.repository.BoardRepository;
import com.dakgu.siack.board.vo.Board;
import com.dakgu.siack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class BoardService {

    private final UserRepository userRepository;
    private final BoardRepository boardRepository;

    public boolean createBoard(BoardRequestDTO boardDto) {

        String username = boardDto.getAuthor();
        Long userCode = userRepository.findUserCodeByUsername(username);

        if(userCode == null) {
            return false;
        }

        Board board = new Board(userCode, boardDto);
        boardRepository.save(board);
        return true;
    }
}
