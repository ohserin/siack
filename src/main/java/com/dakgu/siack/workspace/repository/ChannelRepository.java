package com.dakgu.siack.workspace.repository;

import com.dakgu.siack.workspace.domain.Channel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    boolean existsByWorkspace_WorkspaceIdAndNameIgnoreCase(Long workspaceId, String name);
    long countByWorkspace_WorkspaceIdAndStatusTrue(Long workspaceId);

    // 활성 채널 목록 조회
    List<Channel> findByWorkspace_WorkspaceIdAndStatusTrue(Long workspaceId);

    // 워크스페이스 내 공개 + 활성 채널
    List<Channel> findByWorkspace_WorkspaceIdAndIsPrivateFalseAndStatusTrue(Long workspaceId);
}
