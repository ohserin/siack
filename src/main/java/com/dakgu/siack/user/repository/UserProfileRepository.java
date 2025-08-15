package com.dakgu.siack.user.repository;

import com.dakgu.siack.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    UserProfile findByUserid(Long userId);

    /* UK 중복 여부 확인 메서드 */
    boolean existsByNickname(String nickname);

    @Modifying
    @Transactional
    @Query("UPDATE UserProfile u SET u.nickname = :nickname WHERE u.userid = :userid")
    void updateNickname(@Param("userid") Long userid, @Param("nickname") String nickname);

}
