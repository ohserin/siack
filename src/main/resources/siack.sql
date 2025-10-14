-- siack_db.sdu_role definition

CREATE TABLE `sdu_role`
(
    `ROLE`   tinyint NOT NULL                                             DEFAULT '1' COMMENT '사용자 권한',
    `ROLENM` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '권한이름',
    PRIMARY KEY (`ROLE`),
    UNIQUE KEY `rolenm` (`ROLENM`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='권한정보';


-- siack_db.sdu_user definition

CREATE TABLE `sdu_user`
(
    `USERID`    int                                                           NOT NULL AUTO_INCREMENT COMMENT '고유 사용자 ID',
    `USERNAME`  varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci  NOT NULL COMMENT '사용자 로그인 아이디',
    `PASSWORD`  varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '사용자 비밀번호 (해시값 저장)',
    `PHONE`     varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci           DEFAULT NULL COMMENT '사용자 전화번호',
    `EMAIL`     varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '사용자 이메일 주소',
    `USEYN`     tinyint(1) DEFAULT '0' COMMENT '사용자 계정 삭제 여부 (TRUE: 활성, FALSE: 비활성)',
    `ROLE`      tinyint                                                                DEFAULT '1' COMMENT '사용자 권한 (0: 관리자, 1: 일반 사용자)',
    `CREATEDAT` timestamp                                                     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성 시각',
    `UPDATEDAT` timestamp                                                     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '계정 마지막 업데이트 시각',
    PRIMARY KEY (`USERID`),
    UNIQUE KEY `username` (`USERNAME`),
    UNIQUE KEY `email` (`EMAIL`),
    UNIQUE KEY `phone` (`PHONE`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='유저 기본정보';


-- siack_db.sdw_plan definition

CREATE TABLE `sdw_plan`
(
    `PLANID`      tinyint     NOT NULL AUTO_INCREMENT COMMENT '플랜 ID',
    `NAME`        varchar(20) NOT NULL COMMENT '플랜 이름 (FREE, PRO, ENTERPRISE 등)',
    `DESCRIPTION` varchar(255)         DEFAULT NULL COMMENT '플랜 설명',
    `MAXMEMBERS`  int                  DEFAULT NULL COMMENT '최대 멤버 수 제한',
    `PRICE`       decimal(10, 2)       DEFAULT NULL COMMENT '월 요금',
    `CREATEDAT`   timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    PRIMARY KEY (`PLANID`),
    UNIQUE KEY `NAME` (`NAME`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='워크스페이스 플랜 정보';


-- siack_db.sdf_file definition

CREATE TABLE `sdf_file`
(
    `FILEID`       bigint       NOT NULL AUTO_INCREMENT COMMENT '고유 파일 ID',
    `ORIGINALNAME` varchar(255) NOT NULL COMMENT '업로드 당시 원본 파일명',
    `STOREDNAME`   varchar(255) NOT NULL COMMENT '서버 또는 스토리지에 저장된 파일명 (UUID 등)',
    `PATH`         varchar(500) NOT NULL COMMENT '파일 저장 경로 또는 URL',
    `EXTENSION`    varchar(10)  NOT NULL COMMENT '파일 확장자 (jpg, png, pdf 등)',
    `SIZE`         bigint       NOT NULL COMMENT '파일 크기 (Byte 단위)',
    `CONTENTTYPE`  varchar(100) NOT NULL COMMENT '파일 MIME 타입 (예: image/png)',
    `USERID`       int                   DEFAULT NULL COMMENT '업로드한 사용자 ID (sdu_user.USERID 참조)',
    `STATUS`       tinyint(1) DEFAULT '1' COMMENT '파일 상태 (0: 삭제됨, 1: 활성)',
    `CREATEDAT`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '파일 업로드 시각',
    `UPDATEDAT`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '파일 정보 마지막 수정 시각',
    PRIMARY KEY (`FILEID`),
    KEY            `userid` (`USERID`),
    CONSTRAINT `sdf_file_ibfk_1` FOREIGN KEY (`USERID`) REFERENCES `sdu_user` (`USERID`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='파일 메타데이터 정보';


-- siack_db.sdl_userlog definition

CREATE TABLE `sdl_userlog`
(
    `LOGID`      int         NOT NULL AUTO_INCREMENT COMMENT '고유 로그 ID',
    `USERID`     int         NOT NULL COMMENT '유저 PK (sdu_user.USERID)',
    `IP`         varchar(45) NOT NULL COMMENT '사용자 접속 IP',
    `REGION`     varchar(100)         DEFAULT NULL COMMENT '접속 지역',
    `ACTIONTYPE` varchar(50)          DEFAULT NULL COMMENT '행위 유형 (로그인, 로그아웃, 수정 등)',
    `STATUS`     tinyint              DEFAULT NULL COMMENT '행위 결과 상태 (0: 성공, 1: 실패)',
    `REQUESTURL` varchar(255)         DEFAULT NULL COMMENT '요청 URL 또는 API 엔드포인트',
    `USERAGENT`  varchar(255)         DEFAULT NULL COMMENT '사용자 환경 정보 (브라우저/OS/디바이스)',
    `CONTENT`    text        NOT NULL COMMENT '로그 상세 내용',
    `CREATEDAT`  timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '로그 생성 시각',
    PRIMARY KEY (`LOGID`),
    KEY          `idx_userid` (`USERID`),
    CONSTRAINT `fk_user_log_user` FOREIGN KEY (`USERID`) REFERENCES `sdu_user` (`USERID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=384 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='유저 로그 기록';


-- siack_db.sdu_board definition

CREATE TABLE `sdu_board`
(
    `BOARDID`   int          NOT NULL AUTO_INCREMENT COMMENT '게시글 고유번호',
    `AUTHOR`    int          NOT NULL COMMENT '작성자(회원번호)',
    `TITLE`     varchar(100) NOT NULL COMMENT '게시글 제목',
    `CONTENT`   text         NOT NULL COMMENT '게시글 내용',
    `CREATEDAT` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '작성일자',
    `UPDATEDAT` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    `ISDELETED` tinyint      NOT NULL DEFAULT '0' COMMENT '삭제 여부 (0=정상, 1=삭제됨)',
    PRIMARY KEY (`BOARDID`),
    KEY         `AUTHOR` (`AUTHOR`),
    CONSTRAINT `sdu_board_ibfk_1` FOREIGN KEY (`AUTHOR`) REFERENCES `sdu_user` (`USERID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='게시판 테이블';


-- siack_db.sdu_userprofile definition

CREATE TABLE `sdu_userprofile`
(
    `USERID`     int                                                          NOT NULL COMMENT '사용자 테이블의 ID 참조',
    `NICKNAME`   varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '사용자 닉네임',
    `PROFILEIMG` bigint                                                        DEFAULT NULL COMMENT '파일 ID',
    `STATUSMSG`  varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '사용자 상태 메시지',
    PRIMARY KEY (`USERID`),
    UNIQUE KEY `nickname` (`NICKNAME`),
    CONSTRAINT `sdu_userprofile_ibfk_1` FOREIGN KEY (`USERID`) REFERENCES `sdu_user` (`USERID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='유저 프로필정보';


-- siack_db.sdw_workspace definition

CREATE TABLE `sdw_workspace`
(
    `WORKSPACEID` bigint       NOT NULL AUTO_INCREMENT COMMENT '워크스페이스 고유 ID',
    `NAME`        varchar(255) NOT NULL COMMENT '워크스페이스 이름',
    `DESCRIPTION` varchar(500)          DEFAULT NULL COMMENT '워크스페이스 설명',
    `INVITECODE`  varchar(20)           DEFAULT NULL COMMENT '워크스페이스 초대 코드',
    `PLANID`      tinyint      NOT NULL DEFAULT '1' COMMENT '플랜 ID (sdu_plan.PLANID 참조)',
    `OWNERID`     int          NOT NULL COMMENT '워크스페이스 생성자 (sdu_user.USERID 참조)',
    `STATUS`      tinyint(1) DEFAULT '1' COMMENT '상태 (0: 비활성, 1: 활성)',
    `IMAGEURL`    varchar(255)          DEFAULT NULL COMMENT '워크스페이스 이미지 URL',
    `CREATEDAT`   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    `UPDATEDAT`   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
    PRIMARY KEY (`WORKSPACEID`),
    UNIQUE KEY `INVITECODE` (`INVITECODE`),
    KEY           `ownerid` (`OWNERID`),
    KEY           `sdw_workspace_ibfk_plan` (`PLANID`),
    CONSTRAINT `sdw_workspace_ibfk_1` FOREIGN KEY (`OWNERID`) REFERENCES `sdu_user` (`USERID`),
    CONSTRAINT `sdw_workspace_ibfk_plan` FOREIGN KEY (`PLANID`) REFERENCES `sdw_plan` (`PLANID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='워크스페이스 정보';


-- siack_db.sdw_workspace_member definition

CREATE TABLE `sdw_workspace_member`
(
    `WORKSPACEID` bigint    NOT NULL COMMENT '워크스페이스 ID (sdw_workspace.WORKSPACEID 참조)',
    `USERID`      int       NOT NULL COMMENT '사용자 ID (sdu_user.USERID 참조)',
    `ROLE`        varchar(50)        DEFAULT 'MEMBER' COMMENT '워크스페이스 내 역할 (OWNER, ADMIN, MEMBER)',
    `STATUS`      tinyint(1) DEFAULT '1' COMMENT '상태 (0: 탈퇴, 1: 참여)',
    `BANYN`       tinyint(1) NOT NULL DEFAULT '0' COMMENT '밴 여부 (0: 정상, 1: 밴)',
    `JOINEDAT`    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '워크스페이스 참여 시각',
    PRIMARY KEY (`WORKSPACEID`, `USERID`),
    KEY           `userid` (`USERID`),
    CONSTRAINT `sdw_workspace_member_ibfk_1` FOREIGN KEY (`WORKSPACEID`) REFERENCES `sdw_workspace` (`WORKSPACEID`),
    CONSTRAINT `sdw_workspace_member_ibfk_2` FOREIGN KEY (`USERID`) REFERENCES `sdu_user` (`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='워크스페이스 멤버 정보';


-- siack_db.sdw_channel definition

CREATE TABLE `sdw_channel`
(
    `CHANNELID`   bigint       NOT NULL AUTO_INCREMENT COMMENT '채널 고유 ID',
    `WORKSPACEID` bigint       NOT NULL COMMENT '소속 워크스페이스 ID (sdw_workspace.WORKSPACEID 참조)',
    `NAME`        varchar(255) NOT NULL COMMENT '채널 이름',
    `DESCRIPTION` varchar(500)          DEFAULT NULL COMMENT '채널 설명',
    `ISPRIVATE`   tinyint(1) DEFAULT '0' COMMENT '비공개 여부 (0: 공개, 1: 비공개)',
    `STATUS`      tinyint(1) DEFAULT '1' COMMENT '상태 (0: 비활성, 1: 활성)',
    `CREATEDAT`   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    `UPDATEDAT`   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
    PRIMARY KEY (`CHANNELID`),
    KEY           `workspaceid` (`WORKSPACEID`),
    CONSTRAINT `sdw_channel_ibfk_1` FOREIGN KEY (`WORKSPACEID`) REFERENCES `sdw_workspace` (`WORKSPACEID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='채널 정보';


-- siack_db.sdw_channel_member definition

CREATE TABLE `sdw_channel_member`
(
    `CHANNELID` bigint    NOT NULL COMMENT '채널 ID (sdw_channel.CHANNELID 참조)',
    `USERID`    int       NOT NULL COMMENT '사용자 ID (sdu_user.USERID 참조)',
    `ROLE`      varchar(50)        DEFAULT 'MEMBER' COMMENT '채널 내 역할 (OWNER, ADMIN, MEMBER)',
    `JOINEDAT`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '채널 참여 시각',
    `STATUS`    tinyint(1) DEFAULT '1' COMMENT '상태 (0: 탈퇴, 1: 참여)',
    PRIMARY KEY (`CHANNELID`, `USERID`),
    KEY         `userid` (`USERID`),
    CONSTRAINT `sdw_channel_member_ibfk_1` FOREIGN KEY (`CHANNELID`) REFERENCES `sdw_channel` (`CHANNELID`),
    CONSTRAINT `sdw_channel_member_ibfk_2` FOREIGN KEY (`USERID`) REFERENCES `sdu_user` (`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='채널 멤버 정보';