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

    // 중복 제거: 인증된 사용자 조회 메서드 추가
    private User getAuthenticatedUser(Authentication authentication) {
        String username = authentication.getName();
        if (username == null) {
            throw new IllegalArgumentException("사용자 정보를 찾을 수 없거나 이미 삭제된 계정입니다.");
        }
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("사용자 정보를 찾을 수 없거나 이미 삭제된 계정입니다.");
        }
        return user;
    }

    public ResponseDTO createBoard(Authentication authentication, BoardRequestDTO dto) {
        try {
            User user = getAuthenticatedUser(authentication);
            Board board = new Board(user.getUserid(), dto);
            boardRepository.save(board);
            return new ResponseDTO(HttpStatus.OK.value(), "게시글이 저장되었습니다.");
        } catch (IllegalArgumentException e) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), e.getMessage());
        }
    }

    public BoardListResponseDTO getBoardsPaged(int page, int size) {
        Page<Board> boardPage = boardRepository.findAllByIsDeleted(0, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "boardId")));
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

    public ResponseDTO deleteBoard(Authentication authentication, Long boardId) {
        try {
            User user = getAuthenticatedUser(authentication);
            Board board = boardRepository.findById(boardId).orElse(null);
            if (board == null) {
                return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "해당 게시글을 찾을 수 없습니다.");
            }
            if (!board.getUserId().equals(user.getUserid())) {
                return new ResponseDTO(HttpStatus.FORBIDDEN.value(), "삭제 권한이 없습니다.");
            }
            board.setIsDeleted(1);
            boardRepository.save(board);
            return new ResponseDTO(HttpStatus.OK.value(), "게시글이 삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), e.getMessage());
        }
    }

    public ResponseDTO updateBoard(Authentication authentication, Long boardId, BoardRequestDTO dto) {
        try {
            User user = getAuthenticatedUser(authentication);
            Board board = boardRepository.findById(boardId).orElse(null);
            if (board == null) {
                return new ResponseDTO(HttpStatus.NOT_FOUND.value(), "해당 게시글을 찾을 수 없습니다.");
            }
            if (!board.getUserId().equals(user.getUserid())) {
                return new ResponseDTO(HttpStatus.FORBIDDEN.value(), "수정 권한이 없습니다.");
            }
            board.setTitle(dto.getTitle());
            board.setContent(dto.getContent());
            boardRepository.save(board);
            return new ResponseDTO(HttpStatus.OK.value(), "게시글이 수정되었습니다.");
        } catch (IllegalArgumentException e) {
            return new ResponseDTO(HttpStatus.NOT_FOUND.value(), e.getMessage());
        }
    }

}
