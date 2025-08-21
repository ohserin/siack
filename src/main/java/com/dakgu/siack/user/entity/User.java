package com.dakgu.siack.user.entity;

import com.dakgu.siack.utils.Timestamp;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sdu_user")
public class User extends Timestamp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USERID")
    private Long userid;

    @Column(length = 50, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(length = 30)
    private String phone;

    @Column(length = 100, nullable = false)
    private String email;

    @Column(name = "USEYN", nullable = false)
    private boolean useyn;

    @Column(nullable = false)
    private int role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserProfile userProfile;

    public User(String username, String password, String email, String phone) {
        this();
        this.username = username;
        this.password = password;
        this.email = email;

        if(phone.trim().isEmpty()) this.phone = null;
        else this.phone = phone;

        this.useyn = true;
        this.role = 1;
    }

    public void setUserProfile(UserProfile userProfile) {
        this.userProfile = userProfile;
        if (userProfile != null) {
            userProfile.setUser(this);
        }
    }

    public boolean checkPassword(String rawPassword, BCryptPasswordEncoder passwordEncoder) {
        return passwordEncoder.matches(rawPassword, this.password);
    }
}
