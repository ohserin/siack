package com.dakgu.siack.file.repository;

import com.dakgu.siack.file.vo.SdfFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SdfFileRepository extends JpaRepository<SdfFile, Long> {

    @Query("SELECT sf.storedName FROM SdfFile sf WHERE sf.fileId = :fileId")
    String findStoredFileNameByFileId(@Param("fileId") Long fileId);
}
