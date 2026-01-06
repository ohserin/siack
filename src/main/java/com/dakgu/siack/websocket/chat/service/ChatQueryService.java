package com.dakgu.siack.websocket.chat.service;

import com.dakgu.siack.websocket.chat.domain.Conversation;
import com.dakgu.siack.websocket.chat.repository.ConversationRepository;
import com.dakgu.siack.workspace.domain.Channel;
import com.dakgu.siack.workspace.domain.Workspace;
import com.dakgu.siack.workspace.repository.ChannelRepository;
import com.dakgu.siack.workspace.repository.WorkspaceRepository;
import com.dakgu.siack.workspace.service.WorkspaceMemberService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatQueryService {

    private final ConversationRepository conversationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ChannelRepository channelRepository;
    private final WorkspaceMemberService workspaceMemberService;

    @Transactional
    public Long getOrCreateConversation(Authentication authentication, Long workspaceId, Long channelId) {
        workspaceMemberService.validateWorkspaceMember(authentication, workspaceId);

        return conversationRepository.findIdByWorkspaceAndChannel(workspaceId, channelId)
                .orElseGet(() -> {
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

    @Transactional(readOnly = true)
    public void checkAccessAuthority(Authentication authentication, Long conversationId) {
        Conversation conversation = conversationRepository.findWithWorkspaceById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found: " + conversationId));

        workspaceMemberService.validateWorkspaceMember(authentication, conversation.getWorkspace().getWorkspaceId());
    }
}
