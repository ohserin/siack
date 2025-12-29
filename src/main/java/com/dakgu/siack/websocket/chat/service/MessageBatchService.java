package com.dakgu.siack.websocket.chat.service;

import com.dakgu.siack.websocket.chat.domain.Message;
import com.dakgu.siack.websocket.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * 채팅 메시지를 버퍼링하여 주기적으로 DB에 배치 저장하는 서비스.
 */
@Service
@RequiredArgsConstructor
public class MessageBatchService {

    private final MessageRepository messageRepository;
    private final ConcurrentLinkedQueue<Message> messageQueue = new ConcurrentLinkedQueue<>();

    /**
     * 저장할 메시지를 큐에 추가합니다.
     * @param message 저장할 메시지 엔티티
     */
    public void addMessageToQueue(Message message) {
        messageQueue.add(message);
    }

    /**
     * 5초마다 큐에 쌓인 메시지를 DB에 배치 저장합니다.
     * fixedDelay = 5000 (ms)
     */
    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void flushMessages() {
        if (messageQueue.isEmpty()) return;

        // 큐의 모든 메시지를 로컬 리스트로 가져옴
        List<Message> messagesToSave = new ArrayList<>();
        while (!messageQueue.isEmpty()) {
            messagesToSave.add(messageQueue.poll());
        }

        // 배치 저장
        if (!messagesToSave.isEmpty()) {
            messageRepository.saveAll(messagesToSave);
        }
    }
}
