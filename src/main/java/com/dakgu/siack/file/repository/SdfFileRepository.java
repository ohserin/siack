package com.dakgu.siack.file.repository;

import com.dakgu.siack.file.entity.SdfFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SdfFileRepository extends JpaRepository<SdfFile, Long> {
}
