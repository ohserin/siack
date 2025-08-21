package com.dakgu.siack.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "sdu_userprofile")
public class UserProfile {

    @Id
    @Column(name = "USERID")
    private Long userid;

    @Setter
    @OneToOne
    @MapsId
    @JoinColumn(name = "USERID")
    private User user;

    @Column(name = "NICKNAME", unique = true, nullable = false, length = 30)
    private String nickname;

    @Column(name = "PROFILEIMG")
    private Long profileimg;

    @Column(name = "STATUSMSG", length = 100)
    private String statusmsg;

    public UserProfile(User user, String nickname, Long profileimg, String statusmsg) {
        this.user = user;
        this.nickname = nickname;
        this.profileimg = profileimg;
        this.statusmsg = statusmsg;
    }

}