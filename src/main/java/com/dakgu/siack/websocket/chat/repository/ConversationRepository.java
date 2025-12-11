package com.dakgu.siack.websocket.chat.repository;

import com.dakgu.siack.websocket.chat.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * 워크스페이스 ID와 채널 ID를 기반으로 대화 ID를 조회합니다.
     * 엔티티 전체를 로딩하지 않고 ID만 조회하여 성능을 최적화합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param channelId 채널 ID
     * @return Optional<Long> 대화 ID
     */
    @Query("SELECT c.conversationId FROM Conversation c WHERE c.workspace.workspaceId = :workspaceId AND c.channel.channelId = :channelId")
    Optional<Long> findIdByWorkspaceAndChannel(@Param("workspaceId") Long workspaceId, @Param("channelId") Long channelId);

    /**
     * [추가] 대화(Conversation) ID로 조회 시, 연관된 Workspace 엔티티를 함께 fetch join하여 조회합니다.
     * 이 메서드는 Conversation 객체와 그에 연결된 Workspace의 정보가 모두 필요할 때 N+1 쿼리 문제를 방지합니다.
     *
     * @param conversationId 대화 ID
     * @return Optional<Conversation> (Workspace 포함)
     */
    @Query("SELECT c FROM Conversation c JOIN FETCH c.workspace WHERE c.conversationId = :conversationId")
    Optional<Conversation> findWithWorkspaceById(@Param("conversationId") Long conversationId);
}
