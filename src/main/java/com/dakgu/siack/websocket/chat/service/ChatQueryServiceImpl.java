package com.dakgu.siack.websocket.chat.service;

import com.dakgu.siack.websocket.chat.domain.Conversation;
import com.dakgu.siack.websocket.chat.repository.ConversationRepository;
import com.dakgu.siack.workspace.domain.Channel;
import com.dakgu.siack.workspace.domain.Workspace;
import com.dakgu.siack.workspace.repository.ChannelRepository;
import com.dakgu.siack.workspace.repository.WorkspaceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatQueryServiceImpl implements ChatQueryService {

    private final ConversationRepository conversationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ChannelRepository channelRepository;

    /**
     * 워크스페이스와 채널에 연결된 대화(Conversation)를 찾거나 새로 생성합니다.
     *
     * 1. 워크스페이스와 채널 ID로 기존 대화가 있는지 조회합니다.
     * 2. 대화가 존재하면 해당 ID를 즉시 반환합니다.
     * 3. 대화가 없으면, 워크스페이스와 채널 엔티티를 조회하여 새로운 대화를 생성하고 저장합니다.
     * 4. 새로 생성된 대화의 ID를 반환합니다.
     */
    @Override
    @Transactional
    public Long getOrCreateConversationId(Long workspaceId, Long channelId) {
        // 기존 대화가 있는지 먼저 조회 (성능 최적화)
        return conversationRepository.findIdByWorkspaceAndChannel(workspaceId, channelId)
                .orElseGet(() -> {
                    // 대화가 없으면 새로 생성
                    Workspace workspace = workspaceRepository.findById(workspaceId)
                            .orElseThrow(() -> new EntityNotFoundException("Workspace not found: " + workspaceId));
                    Channel channel = channelRepository.findById(channelId)
                            .orElseThrow(() -> new EntityNotFoundException("Channel not found: " + channelId));

                    Conversation newConversation = Conversation.builder()
                            .workspace(workspace)
                            .channel(channel)
                            .build();

                    return conversationRepository.save(newConversation).getConversationId();
                });
    }
}
