package com.dakgu.siack.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.connection.MessageListener;

@Configuration
public class RedisConfig {

    /** 문자열 전용 Redis 템플릿 */
    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }

    /** Redis Pub/Sub 구독 컨테이너 */
    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            MessageListener subscriber
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        // 1. 패턴 구독
        container.addMessageListener(subscriber, new PatternTopic("chat:room:*:pub"));

        // 2. 에러 핸들러
        container.setErrorHandler(e -> System.err.println("Redis Pub/Sub Error: " + e.getMessage()));

        // 3. (선택사항) 스레드풀 설정 - 대규모 서비스 시 권장
        // container.setTaskExecutor(customThreadPoolExecutor);

        return container;
    }
}
