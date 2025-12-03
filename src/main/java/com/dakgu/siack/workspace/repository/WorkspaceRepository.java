package com.dakgu.siack.workspace.repository;

import com.dakgu.siack.workspace.domain.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    boolean existsByInviteCode(String inviteCode);
    Workspace findByInviteCode(String inviteCode);
}