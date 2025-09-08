package com.dakgu.siack.board.service;

import com.dakgu.siack.board.dto.BoardListResponseDTO;
import com.dakgu.siack.board.dto.BoardRequestDTO;
import com.dakgu.siack.board.dto.BoardResponseDto;
import com.dakgu.siack.board.repository.BoardRepository;
import com.dakgu.siack.board.vo.Board;
import com.dakgu.siack.user.repository.UserProfileRepository;
import com.dakgu.siack.user.repository.UserRepository;
import com.dakgu.siack.user.vo.User;
import com.dakgu.siack.user.vo.UserProfile;
import com.dakgu.siack.utils.ResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class BoardService {

    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final UserProfileRepository userProfileRepository;

    public ResponseDTO createBoard(Authentication authentication, BoardRequestDTO dto) {
        String username = authentication.getName();
        if (username == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없거나 이미 삭제된 계정입니다.");

        User user = userRepository.findByUsername(username);
        if (user == null) return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "사용자 정보를 찾을 수 없거나 이미 삭제된 계정입니다.");

        Board board = new Board(user.getUserid(), dto);
        boardRepository.save(board);
        return new ResponseDTO(HttpStatus.OK.value(), "게시글이 저장되었습니다.");
    }

    public BoardListResponseDTO getBoardsPaged(int page, int size) {
        Page<Board> boardPage = boardRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "boardId")));
        List<BoardResponseDto> dtoList = boardPage.getContent().stream()
            .map(board -> {
                UserProfile userProfile = userProfileRepository.findByUserid(board.getUserId());
                String nickname = userProfile != null ? userProfile.getNickname() : "알수없음";
                return new BoardResponseDto(
                    200,
                    "success",
                    board.getBoardId(),
                    nickname,
                    board.getTitle(),
                    board.getContent(),
                    board.getCreatedat()
                );
            })
            .collect(Collectors.toList());
        return new BoardListResponseDTO(dtoList, boardPage.getTotalElements());
    }

}
