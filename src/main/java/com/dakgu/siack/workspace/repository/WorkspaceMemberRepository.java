package com.dakgu.siack.workspace.repository;

import com.dakgu.siack.workspace.vo.WorkspaceMemberVO;
import com.dakgu.siack.workspace.vo.WorkspaceMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMemberVO, WorkspaceMemberId> {
}

