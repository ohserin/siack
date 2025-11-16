package com.dakgu.siack.websocket.chat.repository;

import com.dakgu.siack.websocket.chat.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
}

