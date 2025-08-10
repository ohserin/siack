package com.dakgu.siack.user.repository;

import com.dakgu.siack.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);

    /* UK 중복 여부 확인 메서드 */
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.phone = :phone WHERE u.userid = :userid")
    int updatePhone(@Param("userid") Long userId, @Param("phone") String phone);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.email = :email WHERE u.userid = :userid")
    int updateEmail(@Param("userid") Long userId, @Param("email") String email);

}

