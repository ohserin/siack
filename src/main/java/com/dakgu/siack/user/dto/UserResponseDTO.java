package com.dakgu.siack.user.dto;

import com.dakgu.siack.utils.ResponseDTO;
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
    private Long userid;
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private Long profileimg;
    private String statusmsg;
    private Integer role;

    public UserResponseDTO(int statusCode, String message, String token, String username, String nickname) {
        super(statusCode, message);
        this.token = token;
        this.username = username;
        this.nickname = nickname;
    }

    public UserResponseDTO(int statusCode, String message, Long userid, String username, String email, String phone,
                           String nickname, Long profileimg, String statusmsg, int role) {
        super(statusCode, message);
        this.userid = userid;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.nickname = nickname;
        this.profileimg = profileimg;
        this.statusmsg = statusmsg;
        this.role = role;
    }

}
