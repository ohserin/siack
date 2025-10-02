import React from 'react';
import {
  Box, Typography, Divider, Avatar, Chip, Button, Grid, Stack, List, ListItem, ListItemText
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function WorkspaceInfo() {
  // 확장된 더미 워크스페이스 정보
  const workspaceInfo = {
    name: '예시 워크스페이스',
    description: '이 워크스페이스는 예시 설명입니다.',
    createdAt: '2025-10-01',
    owner: '홍길동',
    memberCount: 12,
    lastActive: '2025-10-03',
    status: '활성',
    iconUrl: 'https://placehold.co/64x64?text=WS',
    inviteCode: 'ABC123',
    members: [
      { name: '홍길동', avatar: 'https://placehold.co/32x32?text=H' },
      { name: '김철수', avatar: 'https://placehold.co/32x32?text=K' },
      { name: '이영희', avatar: 'https://placehold.co/32x32?text=Y' },
    ],
    notice: [
      { title: '10월 점검 안내', date: '2025-10-02' },
      { title: '신규 기능 출시', date: '2025-09-28' },
    ],
    myRole: 'Admin',
    plan: '무료',
    storage: { used: '1.2GB', total: '5GB' },
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* 상단: 아이콘, 이름, 상태, 초대코드 */}
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar src={workspaceInfo.iconUrl} sx={{ width: 56, height: 56, mr: 2 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>{workspaceInfo.name}</Typography>
          <Chip label={workspaceInfo.status} color={workspaceInfo.status === '활성' ? 'success' : 'default'} size="small" sx={{ mt: 0.5 }} />
        </Box>
        <Box flex={1} />
        <Button variant="outlined" size="small" startIcon={<ContentCopyIcon />} sx={{ ml: 2 }}>
          초대코드: {workspaceInfo.inviteCode}
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
      {/* 정보 그리드 */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6}><Typography>설명: {workspaceInfo.description}</Typography></Grid>
        <Grid item xs={6} sm={3}><Typography>생성일: {workspaceInfo.createdAt}</Typography></Grid>
        <Grid item xs={6} sm={3}><Typography>소유자: {workspaceInfo.owner}</Typography></Grid>
        <Grid item xs={6} sm={3}><Typography>내 역할: {workspaceInfo.myRole}</Typography></Grid>
        <Grid item xs={6} sm={3}><Typography>플랜: {workspaceInfo.plan}</Typography></Grid>
        <Grid item xs={6} sm={3}><Typography>저장소: {workspaceInfo.storage.used} / {workspaceInfo.storage.total}</Typography></Grid>
        <Grid item xs={6} sm={3}><Typography>멤버 수: {workspaceInfo.memberCount}명</Typography></Grid>
        <Grid item xs={6} sm={3}><Typography>최근 활동: {workspaceInfo.lastActive}</Typography></Grid>
      </Grid>
      {/* 멤버 리스트 */}
      <Box mb={2}>
        <Typography fontWeight={600} mb={1}>대표 멤버</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {workspaceInfo.members.map(m => (
            <Avatar key={m.name} src={m.avatar}>{m.name[0]}</Avatar>
          ))}
          <Button size="small">전체보기</Button>
        </Stack>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {/* 공지사항 */}
      <Box>
        <Typography fontWeight={600} mb={1}>공지사항</Typography>
        <List dense>
          {workspaceInfo.notice.map(n => (
            <ListItem key={n.title} disablePadding>
              <ListItemText primary={n.title} secondary={n.date} />
            </ListItem>
          ))}
        </List>
        <Button size="small">더보기</Button>
      </Box>
    </Box>
  );
}

export default WorkspaceInfo;
