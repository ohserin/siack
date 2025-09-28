package com.dakgu.siack.workspace.repository;

import com.dakgu.siack.workspace.vo.WorkspaceMemberVO;
import com.dakgu.siack.workspace.vo.WorkspaceMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMemberVO, WorkspaceMemberId> {
    // 특정 유저가 속한 워크스페이스 멤버십 전체 조회
    List<WorkspaceMemberVO> findByUser_Userid(Long userid);
    // 특정 워크스페이스의 모든 멤버 조회
    List<WorkspaceMemberVO> findByWorkspace_WorkspaceId(Long workspaceId);
    // 특정 워크스페이스 + 사용자 조합 조회 (채널 생성 등 권한 확인 용)
    Optional<WorkspaceMemberVO> findByWorkspace_WorkspaceIdAndUser_Userid(Long workspaceId, Long userId);
}
