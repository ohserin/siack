package com.dakgu.siack.workspace.repository;

import com.dakgu.siack.workspace.vo.ChannelMemberVO;
import com.dakgu.siack.workspace.vo.ChannelMemberIdVO;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChannelMemberRepository extends JpaRepository<ChannelMemberVO, ChannelMemberIdVO> {
}

