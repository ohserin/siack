package com.dakgu.siack.user.repository;

import com.dakgu.siack.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    UserProfile findByUserId(Long userId);

    /* UK 중복 여부 확인 메서드 */
    boolean existsByNickname(String nickname);

}
