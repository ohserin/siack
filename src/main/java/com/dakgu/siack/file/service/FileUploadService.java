package com.dakgu.siack.file.service;

import com.dakgu.siack.file.dto.FileStorageResult;
import com.dakgu.siack.file.entity.SdfFile;
import com.dakgu.siack.file.repository.SdfFileRepository;
import com.dakgu.siack.user.entity.User;
import com.dakgu.siack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final FileService fileService;
    private final SdfFileRepository sdfFileRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long uploadAndSaveMetadata(MultipartFile multipartFile, Authentication authentication) throws IOException {
        if (authentication == null) {
            throw new SecurityException("인증 정보가 없습니다. 로그인이 필요합니다.");
        }

        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("존재하지 않는 사용자입니다: " + username);
        }

        String extension = StringUtils.getFilenameExtension(multipartFile.getOriginalFilename());
        FileStorageResult storageResult = fileService.writeFile(multipartFile.getBytes(), extension);

        SdfFile sdfFile = SdfFile.builder()
                .originalName(multipartFile.getOriginalFilename())
                .storedName(storageResult.getStoredName())
                .path(storageResult.getFullPath())
                .extension(storageResult.getExtension())
                .size(multipartFile.getSize())
                .contentType(multipartFile.getContentType())
                .userId(user.getUserid())
                .build();

        SdfFile savedFile = sdfFileRepository.save(sdfFile);

        return savedFile.getFileId();
    }
}
