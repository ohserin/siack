package com.dakgu.siack.websocket.chat.repository;

import com.dakgu.siack.websocket.chat.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
