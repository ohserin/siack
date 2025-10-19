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
public class MessageAttachmentId implements Serializable {
    private Long message;
    private Long file;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MessageAttachmentId that = (MessageAttachmentId) o;
        return Objects.equals(message, that.message) &&
               Objects.equals(file, that.file);
    }

    @Override
    public int hashCode() {
        return Objects.hash(message, file);
    }
}

