package com.dakgu.siack.workspace.batch;

import com.dakgu.siack.workspace.repository.WorkspaceRepository;
import com.dakgu.siack.workspace.util.InviteCodeUtil;
import com.dakgu.siack.workspace.vo.WorkspaceVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@RequiredArgsConstructor
@Component
public class WorkspaceInviteCodeBatch {
    private final WorkspaceRepository workspaceRepository;

    /**
     * 매일 0시 정각에 모든 워크스페이스의 초대코드를 중복 없이 갱신
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void refreshAllInviteCodes() {
        List<WorkspaceVO> all = workspaceRepository.findAll();
        Set<String> usedCodes = new HashSet<>();
        // 이미 DB에 존재하는 코드도 포함 (동시성 대비)
        workspaceRepository.findAll().forEach(ws -> {
            if (ws.getInviteCode() != null) usedCodes.add(ws.getInviteCode());
        });
        for (WorkspaceVO ws : all) {
            String newCode;
            do {
                newCode = InviteCodeUtil.generateInviteCode();
            } while (usedCodes.contains(newCode) || workspaceRepository.existsByInviteCode(newCode));
            ws.setInviteCode(newCode);
            usedCodes.add(newCode);
        }
        workspaceRepository.saveAll(all);
        log.info("[배치] {}개 워크스페이스 초대코드 갱신 완료", all.size());
    }

}
