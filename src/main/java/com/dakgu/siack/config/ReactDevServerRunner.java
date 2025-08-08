package com.dakgu.siack.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.DisposableBean;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * Spring Boot 애플리케이션 시작 시 React 개발 서버를 함께 실행하고,
 * 애플리케이션 종료 시 함께 종료하는 역할을 합니다.
 * 개발 환경에서만 활성화되어야 합니다.
 * destroy() → destroyForcibly() → taskkill 순으로 종료 시도!
 */
@Component
public class ReactDevServerRunner implements ApplicationRunner, DisposableBean {

    private static final Logger log = LoggerFactory.getLogger(ReactDevServerRunner.class);

    private Process reactProcess;

    /**
     * 애플리케이션이 시작될 때 React 개발 서버를 실행합니다.
     *
     * @param args 애플리케이션 시작 인자
     * @throws Exception 프로세스 실행 중 발생할 수 있는 예외
     */
    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (isPortInUse(3333)) {
            log.info("React 개발 서버가 이미 실행 중입니다. 실행을 건너뜁니다.");
            return;
        }

        String os = System.getProperty("os.name").toLowerCase();
        ProcessBuilder processBuilder;

        // 운영체제에 따라 실행 명령어 설정
        if (os.contains("win")) {
            processBuilder = new ProcessBuilder("cmd", "/c", "npm run dev");
        } else {
            processBuilder = new ProcessBuilder("sh", "-c", "npm run dev");
        }

        // frontend 디렉토리에서 명령어 실행
        processBuilder.directory(new File("src/main/frontend"));
        // 프로세스의 입출력을 현재 프로세스와 연결하여 로그 확인
        processBuilder.inheritIO();

        try {
            reactProcess = processBuilder.start();
            log.info("React 개발 서버를 시작했습니다.");
        } catch (IOException e) {
            log.error("React 개발 서버 시작에 실패했습니다.", e);
        }
    }

    /**
     * 애플리케이션이 종료될 때 실행 중인 React 개발 서버를 종료합니다.
     *
     * @throws Exception 프로세스 종료 중 발생할 수 있는 예외
     */
    @Override
    public void destroy() throws Exception {
        if (reactProcess != null && reactProcess.isAlive()) {
            long pid = reactProcess.pid();
            log.info("React 개발 서버를 중지합니다... PID={}", pid);
            reactProcess.destroy();
            if (!reactProcess.waitFor(5, TimeUnit.SECONDS)) {
                reactProcess.destroyForcibly();
                log.warn("프로세스 정상 종료 실패, 강제 종료 시도 PID={}", pid);
                killProcessByPid(pid); // 자식 프로세스까지 강제 종료
            }
        }

        // 포트 점유 확인 및 강제 종료
        int port = 3333;
        Optional<Long> pidOpt = findPidByPort(port);
        if (pidOpt.isPresent()) {
            log.info("포트 {}를 점유한 프로세스 PID={}를 강제 종료합니다.", port, pidOpt.get());
            killProcessByPid(pidOpt.get());
        }

        // 포트 해제 확인 (지연 추가)
        Thread.sleep(1000); // 포트 해제 대기
        if (isPortInUse(port)) {
            log.error("포트 {}이 여전히 점유 중입니다.", port);
        } else {
            log.info("포트 {}이 정상적으로 해제되었습니다.", port);
        }
    }

    /**
     * 지정한 포트가 사용 중인지 확인합니다.
     *
     * @param port 포트 번호
     * @return 사용 중이면 true, 아니면 false
     */
    private boolean isPortInUse(int port) {
        try (Socket ignored = new Socket("localhost", port)) {
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * 프로세스 PID를 받아 OS 명령어로 강제 종료를 시도합니다.
     *
     * @param pid 프로세스 ID
     */
    private void killProcessByPid(long pid) {
        String os = System.getProperty("os.name").toLowerCase();
        try {
            Process proc;
            if (os.contains("win")) {
                proc = new ProcessBuilder("taskkill", "/PID", String.valueOf(pid), "/F", "/T").start();
            } else {
                proc = new ProcessBuilder("kill", "-9", String.valueOf(pid)).start();
            }
            int exitCode = proc.waitFor();
            if (exitCode == 0) {
                log.info("PID {} 프로세스 및 자식 프로세스를 강제 종료했습니다.", pid);
            } else {
                log.warn("PID {} 종료 명령 실패, exitCode={}", pid, exitCode);
            }
        } catch (Exception e) {
            log.error("PID {} 강제 종료 중 예외 발생: ", pid, e);
        }
    }

    private Optional<Long> findPidByPort(int port) {
        try {
            Process process = new ProcessBuilder("netstat", "-ano").start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains(":" + port) && line.trim().endsWith("LISTENING")) {
                    String[] parts = line.trim().split("\\s+");
                    String pidStr = parts[parts.length - 1];
                    return Optional.of(Long.parseLong(pidStr));
                }
            }
        } catch (Exception e) {
            log.error("포트 {}에 해당하는 PID 조회 실패", port, e);
        }
        return Optional.empty();
    }
}