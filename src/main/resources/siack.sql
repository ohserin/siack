CREATE TABLE `sdu_user`
(
    `USERID`    int          NOT NULL AUTO_INCREMENT COMMENT '고유 사용자 ID',
    `USERNAME`  varchar(50)  NOT NULL COMMENT '사용자 로그인 아이디',
    `PASSWORD`  varchar(255) NOT NULL COMMENT '사용자 비밀번호 (해시값 저장)',
    `PHONE`     varchar(30)           DEFAULT NULL COMMENT '사용자 전화번호',
    `EMAIL`     varchar(100) NOT NULL COMMENT '사용자 이메일 주소',
    `USEYN`     tinyint(1)            DEFAULT '0' COMMENT '사용자 계정 삭제 여부 (TRUE: 삭제됨, FALSE: 활성)',
    `ROLE`      tinyint               DEFAULT '1' COMMENT '사용자 권한 (0: 관리자, 1: 일반 사용자)',
    `CREATEDAT` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성 시각',
    `UPDATEDAT` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '계정 마지막 업데이트 시각',
    PRIMARY KEY (`USERID`),
    UNIQUE KEY `username` (`USERNAME`),
    UNIQUE KEY `email` (`EMAIL`),
    UNIQUE KEY `phone` (`PHONE`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='유저 기본정보';

CREATE TABLE `sdu_userprofile`
(
    `USERID`     int         NOT NULL COMMENT '사용자 테이블의 ID 참조',
    `NICKNAME`   varchar(30) NOT NULL COMMENT '사용자 닉네임',
    `PROFILEIMG` varchar(255) DEFAULT NULL COMMENT '프로필 이미지 URL',
    `STATUSMSG`  varchar(100) DEFAULT NULL COMMENT '사용자 상태 메시지',
    PRIMARY KEY (`USERID`),
    UNIQUE KEY `nickname` (`NICKNAME`),
    CONSTRAINT `sdu_userprofile_ibfk_1` FOREIGN KEY (`USERID`) REFERENCES `sdu_user` (`USERID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='유저 프로필정보';

CREATE TABLE `sdu_role`
(
    `ROLE`   tinyint NOT NULL DEFAULT '1' COMMENT '사용자 권한',
    `ROLENM` varchar(30)      DEFAULT NULL COMMENT '권한이름',
    PRIMARY KEY (`ROLE`),
    UNIQUE KEY `rolenm` (`ROLENM`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='권한정보';


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
    `STATUS`       tinyint(1)            DEFAULT '1' COMMENT '파일 상태 (0: 삭제됨, 1: 활성)',
    `CREATEDAT`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '파일 업로드 시각',
    `UPDATEDAT`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '파일 정보 마지막 수정 시각',
    PRIMARY KEY (`FILEID`),
    KEY `userid` (`USERID`),
    CONSTRAINT FOREIGN KEY (`USERID`) REFERENCES `sdu_user` (`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='파일 메타데이터 정보';