package com.dakgu.siack.utils;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
public class Timestamp {

    @Column(nullable = false, updatable = false)
    private java.sql.Timestamp createAt;

    @Column(nullable = false)
    private java.sql.Timestamp updateAt;

    @PrePersist
    public void prePersist() {
        java.sql.Timestamp now = new java.sql.Timestamp(System.currentTimeMillis());
        this.createAt = now;
        this.updateAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updateAt = new java.sql.Timestamp(System.currentTimeMillis());
    }

}
