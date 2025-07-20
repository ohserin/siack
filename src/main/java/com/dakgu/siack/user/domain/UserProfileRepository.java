package com.dakgu.siack.user.domain;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    /* UK 중복 여부 확인 메서드 */
    boolean existsByNickname(String nickname);

}
