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
    private String username;
    private String nickname;

    public UserResponseDTO(int statusCode, String message, String token, String username, String nickname) {
        super(statusCode, message);
        this.token = token;
        this.username = username;
        this.nickname = nickname;
    }

}
