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
import java.util.Base64;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "file.access.mode", havingValue = "remote")
public class SshFileService implements FileService {

    private final SshConfig sshConfig;
    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png");

    public SshFileService(SshConfig sshConfig) {
        this.sshConfig = sshConfig;
        log.info("SshFileService가 활성화되었습니다. 원격 서버에 SSH로 접근합니다.");
    }

    @Override
    public String readFile(String path) {
        Session session = null;
        ChannelSftp channelSftp = null;
        try {
            session = createSession();
            channelSftp = createSftpChannel(session);
            try (InputStream inputStream = channelSftp.get(path)) {
                byte[] fileBytes = inputStream.readAllBytes();
                return Base64.getEncoder().encodeToString(fileBytes);
            }
        } catch (Exception e) {
            log.error("원격 파일 읽기 실패: path={}, error={}", path, e.getMessage(), e);
            throw new RuntimeException("원격 파일 읽기에 실패했습니다. 경로: " + path, e);
        } finally {
            disconnect(session, channelSftp);
        }
    }

    @Override
    public FileStorageResult writeFile(byte[] content, String extension) {
        String lowercasedExtension = (extension != null) ? extension.toLowerCase() : "";
        String category = getFileCategory(lowercasedExtension);

        String uuid = UUID.randomUUID().toString();
        String newFilename = uuid + "." + lowercasedExtension;
        String directoryPath = sshConfig.getUploadPath() + "/" + category;
        String finalPath = directoryPath + "/" + newFilename;

        Session session = null;
        ChannelSftp channelSftp = null;
        try {
            session = createSession();
            channelSftp = createSftpChannel(session);

            ensureDirectoriesExist(channelSftp, directoryPath);

            try (InputStream inputStream = new ByteArrayInputStream(content)) {
                channelSftp.put(inputStream, finalPath);
                log.info("원격 파일 쓰기 성공: {}", finalPath);
            }

            return new FileStorageResult(newFilename, finalPath, category, lowercasedExtension);

        } catch (Exception e) {
            log.error("원격 파일 쓰기 실패: path={}, error={}", finalPath, e.getMessage(), e);
            throw new RuntimeException("원격 파일 쓰기에 실패했습니다. 경로: " + finalPath, e);
        } finally {
            disconnect(session, channelSftp);
        }
    }

    private String getFileCategory(String extension) {
        if (IMAGE_EXTENSIONS.contains(extension)) {
            return "images";
        }
        throw new IllegalArgumentException("지원하지 않는 파일 형식입니다: " + extension);
    }

    private void ensureDirectoriesExist(ChannelSftp channel, String path) throws SftpException {
        String[] folders = path.split("/");
        StringBuilder currentPath = new StringBuilder();
        if (path.startsWith("/")) {
            currentPath.append("/");
        }

        for (String folder : folders) {
            if (folder.isEmpty()) continue;
            currentPath.append(folder);
            try {
                channel.stat(currentPath.toString());
            } catch (SftpException e) {
                if (e.id == ChannelSftp.SSH_FX_NO_SUCH_FILE) {
                    log.info("디렉터리가 존재하지 않아 생성합니다: {}", currentPath);
                    channel.mkdir(currentPath.toString());
                } else {
                    throw e;
                }
            }
            currentPath.append("/");
        }
    }

    private Session createSession() throws JSchException {
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
        } catch (IOException e) {
            throw new JSchException("개인 키 파일을 읽는 중 오류가 발생했습니다.", e);
        }
        Session session = jsch.getSession(sshConfig.getUsername(), sshConfig.getHost(), sshConfig.getPort());
        session.setConfig("StrictHostKeyChecking", "no");
        session.setTimeout(sshConfig.getSessionTimeout());
        session.connect();
        return session;
    }

    private ChannelSftp createSftpChannel(Session session) throws JSchException {
        ChannelSftp channelSftp = (ChannelSftp) session.openChannel("sftp");
        channelSftp.connect(sshConfig.getChannelTimeout());
        return channelSftp;
    }

    private void disconnect(Session session, Channel channel) {
        if (channel != null && channel.isConnected()) {
            channel.disconnect();
        }
        if (session != null && session.isConnected()) {
            session.disconnect();
        }
    }
}
