package com.dakgu.siack.file.service;

import com.dakgu.siack.file.config.SshConfig;
import com.dakgu.siack.file.dto.FileStorageResult;
import com.jcraft.jsch.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "file.access.mode", havingValue = "remote")
public class SshFileService implements FileService {
    private final SshConfig sshConfig;
    private static final String DEFAULT_EXTENSION = "bin";
    private static final DateTimeFormatter YEAR_MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM");

    public SshFileService(SshConfig sshConfig) {
        this.sshConfig = sshConfig;
        log.info("SshFileService가 활성화되었습니다. 원격 서버에 SSH로 접근합니다.");
    }

    /**
     * 원격 서버에서 지정한 경로의 파일을 읽어 바이트 배열로 반환합니다.
     */
    @Override
    public byte[] readFile(String path) {
        Session session = null;
        ChannelSftp channelSftp = null;
        try {
            session = createSession();
            channelSftp = createSftpChannel(session);
            try (InputStream inputStream = channelSftp.get(path)) {
                return inputStream.readAllBytes();
            }
        } catch (Exception e) {
            log.error("원격 파일 읽기 실패: path={}, error={}", path, e.getMessage(), e);
            throw new RuntimeException("원격 파일 읽기에 실패했습니다. 경로: " + path, e);
        } finally {
            disconnect(session, channelSftp);
        }
    }

    /**
     * 원격 서버에 파일을 저장하고 저장 결과 정보를 반환합니다.
     */
    @Override
    public FileStorageResult writeFile(byte[] content, String extension) {
        String ext = getSafeExtension(extension);
        String newFilename = buildFileName(ext);
        String directoryPath = buildDirectoryPath();
        String finalPath = directoryPath + "/" + newFilename;
        Session session = null;
        ChannelSftp channelSftp = null;
        try {
            session = createSession();
            channelSftp = createSftpChannel(session);
            ensureDirectoriesExist(channelSftp, directoryPath);
            try (InputStream inputStream = new ByteArrayInputStream(content)) {
                channelSftp.put(inputStream, finalPath);
            }
            log.info("원격 파일 저장 성공: path={}, filename={}", finalPath, newFilename);
            return new FileStorageResult(newFilename, finalPath, null, ext);
        } catch (Exception e) {
            log.error("원격 파일 저장 실패: path={}, error={}", finalPath, e.getMessage(), e);
            throw new RuntimeException("원격 파일 쓰기에 실패했습니다. 경로: " + finalPath, e);
        } finally {
            disconnect(session, channelSftp);
        }
    }

    /**
     * 현재 년월 폴더 경로를 반환합니다. (예: /upload/2025/09)
     */
    private String buildDirectoryPath() {
        return sshConfig.getUploadPath() + "/" + LocalDate.now().format(YEAR_MONTH_FORMAT);
    }

    /**
     * uuid와 확장자를 조합해 저장 파일명을 생성합니다.
     */
    private String buildFileName(String extension) {
        return UUID.randomUUID() + "." + extension;
    }

    /**
     * 확장자가 null/빈값이면 기본 확장자(bin)로 반환합니다.
     */
    private String getSafeExtension(String extension) {
        return (Objects.nonNull(extension) && !extension.isBlank()) ? extension.toLowerCase() : DEFAULT_EXTENSION;
    }

    /**
     * SFTP 경로에 지정된 모든 폴더가 존재하는지 확인하고, 없으면 생성합니다.
     */
    private void ensureDirectoriesExist(ChannelSftp channel, String path) throws SftpException {
        if (path == null || path.isBlank()) return;
        String[] folders = path.split("/");
        StringBuilder currentPath = new StringBuilder();
        if (path.startsWith("/")) currentPath.append("/");
        for (String folder : folders) {
            if (folder.isEmpty()) continue;
            currentPath.append(folder);
            try {
                channel.stat(currentPath.toString());
            } catch (SftpException e) {
                if (e.id == ChannelSftp.SSH_FX_NO_SUCH_FILE) {
                    channel.mkdir(currentPath.toString());
                } else {
                    throw e;
                }
            }
            currentPath.append("/");
        }
    }

    /**
     * SSH 세션을 생성하고 연결합니다.
     */
    private Session createSession() throws JSchException, IOException {
        JSch jsch = new JSch();
        String privateKeyPath = sshConfig.getPrivateKeyPath();
        if (privateKeyPath == null || privateKeyPath.isEmpty()) {
            throw new JSchException("SSH 접속을 위한 개인 키 경로(ssh.private-key-path)가 설정되지 않았습니다.");
        }
        try (InputStream privateKeyStream = SshFileService.class.getClassLoader().getResourceAsStream(privateKeyPath)) {
            if (privateKeyStream == null) {
                throw new JSchException("클래스패스에서 개인 키 파일을 찾을 수 없습니다: " + privateKeyPath);
            }
            byte[] privateKeyBytes = privateKeyStream.readAllBytes();
            jsch.addIdentity(sshConfig.getUsername(), privateKeyBytes, null, null);
        }
        Session session = jsch.getSession(sshConfig.getUsername(), sshConfig.getHost(), sshConfig.getPort());
        session.setConfig("StrictHostKeyChecking", "no");
        session.setTimeout(sshConfig.getSessionTimeout());
        session.connect();
        return session;
    }

    /**
     * 연결된 SSH 세션에서 SFTP 채널을 생성하고 연결합니다.
     */
    private ChannelSftp createSftpChannel(Session session) throws JSchException {
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect(sshConfig.getChannelTimeout());
        return channelSftp;
    }

    /**
     * Session, ChannelSftp 안전 해제
     */
    private void disconnect(Session session, ChannelSftp channelSftp) {
        if (channelSftp != null && channelSftp.isConnected()) channelSftp.disconnect();
        if (session != null && session.isConnected()) session.disconnect();
    }
}
