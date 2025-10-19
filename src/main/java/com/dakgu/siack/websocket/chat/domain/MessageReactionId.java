package com.dakgu.siack.websocket.chat.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageReactionId implements Serializable {
    private Long message;
    private Long user;
    private String emoji;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MessageReactionId that = (MessageReactionId) o;
        return Objects.equals(message, that.message) &&
               Objects.equals(user, that.user) &&
               Objects.equals(emoji, that.emoji);
    }

    @Override
    public int hashCode() {
        return Objects.hash(message, user, emoji);
    }
}

