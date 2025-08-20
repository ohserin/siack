package com.dakgu.siack.remote.service;

import com.dakgu.siack.remote.config.SshConfig;
import com.jcraft.jsch.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.stream.Collectors;

/**
 * SSH를 통해 원격 서버의 파일을 읽고 쓰는 비즈니스 로직을 처리하는 서비스입니다.
 * `file.access.mode` 속성이 `remote`일 때 활성화됩니다.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "file.access.mode", havingValue = "remote")
public class SshFileService implements FileService {

    private final SshConfig sshConfig; // SSH 설정 정보 주입

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

            try (InputStream inputStream = channelSftp.get(path);
                 InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                 BufferedReader bufferedReader = new BufferedReader(reader)) {

                log.info("원격 파일 읽기 성공: {}", path);
                return bufferedReader.lines().collect(Collectors.joining(System.lineSeparator()));
            }

        } catch (Exception e) {
            throw new RuntimeException("원격 파일 읽기에 실패했습니다. 경로: " + path, e);
        } finally {
            disconnect(session, channelSftp);
        }
    }

    @Override
    public void writeFile(String path, String content) {
        String lowerCasePath = path.toLowerCase();
        if (!lowerCasePath.endsWith(".jpg") && !lowerCasePath.endsWith(".jpeg") && !lowerCasePath.endsWith(".png")) {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다. .jpg, .jpeg, .png 파일만 업로드할 수 있습니다.");
        }

        Session session = null;
        ChannelSftp channelSftp = null;

        try {
            session = createSession();
            channelSftp = createSftpChannel(session);

            byte[] fileContent = Base64.getDecoder().decode(content);

            try (InputStream inputStream = new ByteArrayInputStream(fileContent)) {
                channelSftp.put(inputStream, path);
            }

        } catch (Exception e) {
            throw new RuntimeException("원격 파일 쓰기에 실패했습니다. 경로: " + path, e);
        } finally {
            disconnect(session, channelSftp);
        }
    }

    /**
     * 클래스패스에 포함된 개인 키를 사용하여 JSch 세션을 생성하고 연결합니다.
     *
     * @return 연결된 JSch 세션 객체
     * @throws JSchException 세션 생성 또는 연결 실패 시
     */
    private Session createSession() throws JSchException {
        JSch jsch = new JSch();

        String privateKeyPath = sshConfig.getPrivateKeyPath();
        if (privateKeyPath == null || privateKeyPath.isEmpty()) {
            throw new JSchException("SSH 접속을 위한 개인 키 경로(ssh.private-key-path)가 설정되지 않았습니다.");
        }

        // 클래스패스에서 개인 키 파일을 읽어옵니다.
        try (InputStream privateKeyStream = SshFileService.class.getClassLoader().getResourceAsStream(privateKeyPath)) {
            if (privateKeyStream == null) {
                throw new JSchException("클래스패스에서 개인 키 파일을 찾을 수 없습니다: " + privateKeyPath);
            }

            // InputStream을 byte 배열로 변환합니다.
            byte[] privateKeyBytes = privateKeyStream.readAllBytes();

            // byte 배열로부터 개인 키를 등록합니다. (개인 키에 암호가 없다고 가정)
            jsch.addIdentity(
                sshConfig.getUsername(), // 키에 대한 식별자 (보통 사용자 이름)
                privateKeyBytes,       // 개인 키의 byte 배열
                null,                  // 공개 키의 byte 배열 (null 가능)
                null                   // 개인 키의 암호 (없으면 null)
            );

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
