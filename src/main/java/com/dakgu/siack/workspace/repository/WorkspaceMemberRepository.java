package com.dakgu.siack.workspace.repository;

import com.dakgu.siack.workspace.vo.WorkspaceMemberVO;
import com.dakgu.siack.workspace.vo.WorkspaceMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMemberVO, WorkspaceMemberId> {
    // 특정 유저가 속한 워크스페이스 멤버십 전체 조회
    java.util.List<WorkspaceMemberVO> findByUser_Userid(Long userid);
    // 특정 워크스페이스의 모든 멤버 조회
    java.util.List<WorkspaceMemberVO> findByWorkspace_Id(Long workspaceId);
}
