package com.dakgu.siack.user.service;

import com.dakgu.siack.user.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;

    /**
     * 주어진 사용자 이름(userName)이 이미 존재하는지 확인합니다.
     *
     * @param userName 중복 확인을 요청하는 사용자 이름
     * @return userName이 이미 존재하면 true, 존재하지 않으면 false
     */
    @Transactional(readOnly = true)
    public boolean checkUsernameDuplication(String userName) {
        return userRepository.existsByUsername(userName);
    }
}
