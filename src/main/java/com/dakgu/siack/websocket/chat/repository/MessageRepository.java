package com.dakgu.siack.websocket.chat.repository;

import com.dakgu.siack.websocket.chat.domain.Conversation;
import com.dakgu.siack.websocket.chat.domain.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @EntityGraph(attributePaths = {"sender", "conversation"})
    List<Message> findByConversationOrderByCreatedatDesc(Conversation conversation, Pageable pageable);
}