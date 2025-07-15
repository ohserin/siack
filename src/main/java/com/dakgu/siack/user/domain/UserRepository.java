package com.dakgu.siack.user.domain;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    public User findByUsername(String username);

    /* UK 중복 여부 확인 메서드 */
    public boolean existsByUsername(String username);
    public boolean existsByEmail(String email);
    public boolean existsByPhone(String phone);
}

