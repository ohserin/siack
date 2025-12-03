package com.dakgu.siack.websocket.chat.repository;

import com.dakgu.siack.websocket.chat.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * 워크스페이스 ID와 채널 ID를 기반으로 Conversation의 ID를 조회합니다.
     * 엔티티 전체를 로딩하지 않고 ID만 조회하여 성능을 최적화합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param channelId 채널 ID
     * @return 조회된 Conversation의 ID (Optional)
     */
    @Query("SELECT c.conversationId FROM Conversation c WHERE c.workspace.workspaceId = :workspaceId AND c.channel.channelId = :channelId")
    Optional<Long> findIdByWorkspaceAndChannel(@Param("workspaceId") Long workspaceId, @Param("channelId") Long channelId);
}
