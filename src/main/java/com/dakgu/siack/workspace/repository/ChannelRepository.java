package com.dakgu.siack.workspace.repository;

import com.dakgu.siack.workspace.vo.ChannelVO;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChannelRepository extends JpaRepository<ChannelVO, Long> {
    boolean existsByWorkspace_WorkspaceIdAndNameIgnoreCase(Long workspaceId, String name);
}
