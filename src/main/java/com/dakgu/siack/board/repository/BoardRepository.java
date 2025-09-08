package com.dakgu.siack.board.repository;

import com.dakgu.siack.board.vo.Board;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, Long> {



}