package com.dakgu.siack.user.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Setter
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "nickname", unique = true, nullable = false, length = 30)
    private String nickname;

    @Column(name = "profile_img", length = 255)
    private String profileImg;

    @Column(name = "status_message", length = 100)
    private String statusMessage;

    public UserProfile(User user, String nickname, String profileImg, String statusMessage) {
        this.user = user;
        this.nickname = nickname;
        this.profileImg = profileImg;
        this.statusMessage = statusMessage;
    }

}