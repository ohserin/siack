package com.dakgu.siack.workspace.repository;

import com.dakgu.siack.workspace.vo.WorkspaceVO;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceRepository extends JpaRepository<WorkspaceVO, Long> {
    boolean existsByInviteCode(String inviteCode);
    WorkspaceVO findByInviteCode(String inviteCode);
}