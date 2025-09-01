package com.dakgu.siack.log.repository;

import com.dakgu.siack.log.vo.UserLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserLogRepository extends JpaRepository<UserLog, Integer> {
    Page<UserLog> findByUserid(int userid, Pageable pageable);
}
