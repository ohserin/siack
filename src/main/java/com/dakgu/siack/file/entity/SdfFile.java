package com.dakgu.siack.file.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sdf_file")
@Getter
@NoArgsConstructor
public class SdfFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FILEID")
    private Long fileId;

    @Column(name = "ORIGINALNAME", nullable = false)
    private String originalName;

    @Column(name = "STOREDNAME", nullable = false)
    private String storedName;

    @Column(name = "PATH", nullable = false, length = 500)
    private String path;

    @Column(name = "EXTENSION", nullable = false, length = 10)
    private String extension;

    @Column(name = "SIZE", nullable = false)
    private Long size;

    @Column(name = "CONTENTTYPE", nullable = false, length = 100)
    private String contentType;

    @Column(name = "USERID")
    private Long userId;

    @Column(name = "STATUS")
    private boolean status = true;

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATEDAT", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public SdfFile(String originalName, String storedName, String path, String extension, Long size, String contentType, Long userId) {
        this.originalName = originalName;
        this.storedName = storedName;
        this.path = path;
        this.extension = extension;
        this.size = size;
        this.contentType = contentType;
        this.userId = userId;
    }
}
