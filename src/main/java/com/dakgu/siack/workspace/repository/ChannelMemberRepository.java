package com.dakgu.siack.workspace.repository;

import com.dakgu.siack.workspace.domain.ChannelMember;
import com.dakgu.siack.workspace.domain.ChannelMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChannelMemberRepository extends JpaRepository<ChannelMember, ChannelMemberId> {
    // 특정 채널에 유저가 이미 들어가 있는지 체크
    boolean existsByChannel_ChannelIdAndUser_Userid(Long channelId, Long userid);
}

