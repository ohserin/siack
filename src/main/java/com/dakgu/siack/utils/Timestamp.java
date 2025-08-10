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
    private java.sql.Timestamp createdat;

    @Column(nullable = false)
    private java.sql.Timestamp updatedat;

    @PrePersist
    public void prePersist() {
        java.sql.Timestamp now = new java.sql.Timestamp(System.currentTimeMillis());
        this.createdat = now;
        this.updatedat = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedat = new java.sql.Timestamp(System.currentTimeMillis());
    }

}
