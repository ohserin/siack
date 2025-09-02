package com.dakgu.siack.log.vo;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sdl_userlog")
public class UserLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LOGID")
    private int logid;

    @Column(name = "USERID", nullable = false)
    private int userid;

    @Column(name = "IP", nullable = false, length = 45)
    private String ip;

    @Column(name = "REGION", length = 100)
    private String region;

    @Column(name = "ACTIONTYPE", length = 50)
    private String actiontype;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "REQUESTURL", length = 255)
    private String requesturl;

    @Column(name = "USERAGENT", length = 255)
    private String useragent;

    @Column(name = "CONTENT", nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdat;
}
