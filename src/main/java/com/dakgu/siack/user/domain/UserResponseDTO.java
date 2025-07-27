package com.dakgu.siack.user.domain;

import com.dakgu.siack.util.ResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO extends ResponseDTO {
    private String token;
    private Long userId;
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private String profileImg;
    private String statusMessage;
    private Integer role;

    public UserResponseDTO(int statusCode, String message, String token, String username, String nickname) {
        super(statusCode, message);
        this.token = token;
        this.username = username;
        this.nickname = nickname;
    }

    public UserResponseDTO(int statusCode, String message, Long userId, String username, String email, String phone,
                           String nickname, String profileImg, String statusMessage, Integer role) {
        super(statusCode, message);
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.nickname = nickname;
        this.profileImg = profileImg;
        this.statusMessage = statusMessage;
        this.role = role;
    }

}
