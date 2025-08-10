package com.dakgu.siack.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.DisposableBean;

import java.io.*;
import java.net.Socket;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Component
public class ReactDevServerRunner implements ApplicationRunner, DisposableBean {

    private static final Logger log = LoggerFactory.getLogger(ReactDevServerRunner.class);

    private Process reactProcess;
    private static final int PORT = 3333;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (isPortInUse(PORT)) {
            log.info("포트 {}가 이미 사용 중이므로 React 개발 서버 실행을 건너뜁니다.", PORT);
            return;
        }

        String os = System.getProperty("os.name").toLowerCase();
        ProcessBuilder processBuilder;

        if (os.contains("win")) {
            processBuilder = new ProcessBuilder("cmd", "/c", "npm run dev");
        } else {
            processBuilder = new ProcessBuilder("sh", "-c", "npm run dev");
        }

        processBuilder.directory(new File("src/main/frontend"));
        processBuilder.redirectErrorStream(true);

        try {
            reactProcess = processBuilder.start();
            log.info("React 개발 서버를 시작했습니다. (PID={})", reactProcess.pid());

            new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(reactProcess.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        log.info("[React] {}", line);
                    }
                } catch (IOException e) {
                    log.error("React 서버 로그 읽기 오류", e);
                }
            }).start();

        } catch (IOException e) {
            log.error("React 개발 서버 시작 실패", e);
        }
    }

    @Override
    public void destroy() throws Exception {
        log.info("React 개발 서버 종료 시도...");

        Optional<Long> portPid = findPidByPort(PORT);
        if (portPid.isPresent()) {
            killProcessByPid(portPid.get());
            Thread.sleep(1000);
        }

        // 2. reactProcess 직접 종료
        if (reactProcess != null && reactProcess.isAlive()) {
            long pid = reactProcess.pid();
            reactProcess.destroy();
            if (!reactProcess.waitFor(3, TimeUnit.SECONDS)) {
                reactProcess.destroyForcibly();
                killProcessByPid(pid);
            }
        }

        if (isPortInUse(PORT)) {
            log.error("포트 {}이 여전히 점유 중입니다. 수동 종료 필요.", PORT);
        } else {
            log.info("포트 {}이 정상적으로 해제되었습니다.", PORT);
        }
    }

    /** 지정한 포트 사용 여부 확인 */
    private boolean isPortInUse(int port) {
        try (Socket ignored = new Socket("localhost", port)) {
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    /** PID 강제 종료 */
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
                log.info("PID {} 프로세스 종료 성공", pid);
            } else {
                log.warn("PID {} 종료 실패 (exitCode={})", pid, exitCode);
            }
        } catch (Exception e) {
            log.error("PID {} 강제 종료 실패", pid, e);
        }
    }

    /** 포트 기반 PID 조회 */
    private Optional<Long> findPidByPort(int port) {
        String os = System.getProperty("os.name").toLowerCase();
        try {
            Process process;
            if (os.contains("win")) {
                process = new ProcessBuilder("cmd", "/c", "netstat -ano | findstr :" + port).start();
            } else {
                process = new ProcessBuilder("sh", "-c", "lsof -i :" + port + " -t").start();
            }
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (!line.isEmpty()) {
                        String[] parts = line.split("\\s+");
                        String last = parts[parts.length - 1];
                        return Optional.of(Long.parseLong(last));
                    }
                }
            }
        } catch (Exception e) {
            log.error("포트 {} PID 조회 실패", port, e);
        }
        return Optional.empty();
    }
}
