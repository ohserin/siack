package com.dakgu.siack.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.connection.MessageListener;

/*
 * Redis 설정 모음 클래스
 *
 * - StringRedisTemplate: 문자열 기반 Redis 연산에 사용
 *   (채팅 메시지 JSON 캐시/발행 등에 사용)
 * - RedisMessageListenerContainer: "chat:room:*:pub" 패턴 구독
 *   들어온 메시지는 등록된 MessageListener(예: RedisChatSubscriber)로 전달
 *   다중 인스턴스 간 채팅 이벤트를 동기화하는 데 사용
 *
 * 참고
 * - 단일 인스턴스면 컨테이너 필수 X
 * - TLS가 필요하면 application.yml에서 redis:// URL 사용
 */
@Configuration
public class RedisConfig {

    /*
     * 문자열 전용 Redis 템플릿
     * 키/값이 전부 String일 때 다루기 편하고 JSON 패턴과 높은 호환도
     */
    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }

    /*
     * Redis Pub/Sub 구독 컨테이너
     * chat:room:{roomId}:pub 채널을 패턴으로 한 번에 구독
     * 실제 메시지 처리는 MessageListener 구현체가 맡음
     */
    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            MessageListener subscriber
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        // 채팅방 퍼블리시 채널 패턴 구독: chat:room:{roomId}:pub
        container.addMessageListener(subscriber, new PatternTopic("chat:room:*:pub"));
        return container;
    }
}
