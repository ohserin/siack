import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, ListItemText, Avatar, Grid, Skeleton, Chip, Stack } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../api/api';
import WorkspaceHeader from './components/Header.jsx';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';

function WorkspaceSettings() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { loading: authLoading, guard } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    if (!authLoading) guard(true, '/');
  }, [authLoading, guard]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(`/v1/workspace/${roomId}`)
      .then(res => { if (!mounted) return; setWorkspace(res.data || null); setLoading(false); })
      .catch(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
  }, [roomId]);

  // 더미 데이터 (개발 가이드)
  const dummyMembers = useMemo(() => ([
    { id: 'u1', nickname: '홍길동', email: 'hong@example.com', role: 'owner' },
    { id: 'u2', nickname: '김영희', email: 'young@example.com', role: 'member' },
    { id: 'u3', nickname: '박철수', email: 'chul@example.com', role: 'member' },
    { id: 'u4', nickname: 'Lee John', email: 'john@example.com', role: 'guest' },
  ]), []);
  const dummyChannels = useMemo(() => ([
    { id: 'c1', name: '일반', description: '팀 공지와 일상 소통 채널' },
    { id: 'c2', name: '디자인팀', description: 'UI/UX 관련 논의' },
    { id: 'c3', name: '백엔드', description: 'API/DB 이슈 공유' },
  ]), []);

  const wsName = workspace?.name || `워크스페이스 #${roomId}`;
  const wsDesc = (workspace && 'description' in workspace) ? (workspace.description || '') : '워크스페이스 소개 문구를 여기에 작성하세요.';
  const members = (workspace?.users && workspace.users.length > 0) ? workspace.users : dummyMembers;
  const channels = (workspace?.channels && workspace.channels.length > 0) ? workspace.channels : dummyChannels;

  const colorFrom = (seed) => {
    if (!seed) return '#9e9e9e';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 60% 60%)`;
  };

  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8f9fa' }}>
      <WorkspaceHeader channelName={wsName} onExit={() => navigate(`/workspace/room/${roomId}`)} />

      <Box sx={{ width: '100%', maxWidth: 'none', px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading ? (
          <Stack spacing={2}>
            <Paper elevation={0} sx={{ width: '100%', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Skeleton variant="text" width={160} height={28} />
              <Skeleton variant="rectangular" height={18} sx={{ mt: 1.5, width: 240 }} />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="80%" />
            </Paper>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <Paper elevation={0} sx={{ width: '100%', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Skeleton variant="text" width={120} height={24} />
                  {[...Array(3)].map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                      <Skeleton variant="circular" width={30} height={30} />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={12} md={12}>
                <Paper elevation={0} sx={{ width: '100%', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Skeleton variant="text" width={120} height={24} />
                  {[...Array(3)].map((_, i) => (
                    <Box key={i} sx={{ mt: 1.5 }}>
                      <Skeleton variant="text" width="50%" />
                      <Skeleton variant="text" width="80%" />
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        ) : (
          <>
            {/* 워크스페이스 정보 확인 */}
            <Paper elevation={0} sx={{ width: '100%', p: { xs: 2, md: 2.5 }, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>워크스페이스 정보</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.25 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: 'primary.main', mr: 1.25, opacity: 0.95 }} />
                <Typography variant="subtitle1" fontWeight={700} className="line-clamp-1">
                  {wsName}
                </Typography>
              </Box>
              {wsDesc && (
                <Typography sx={{ color: 'text.secondary' }} className="line-clamp-3">{wsDesc}</Typography>
              )}
            </Paper>

            {/* 구성원/채널 2열 배치 */}
            <Grid container spacing={2}>
              {/* 구���원 리스트 */}
              <Grid item xs={12} md={12}>
                <Paper elevation={0} sx={{ width: '100%', p: { xs: 2, md: 2.5 }, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupRoundedIcon sx={{ color: 'secondary.main' }} />
                      <Typography variant="h6" fontWeight={800}>구성원</Typography>
                    </Box>
                    <Chip size="small" label={`${members.length}명`} sx={{ bgcolor: 'grey.100' }} />
                  </Box>
                  {members.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary' }}>구성원이 없습니다.</Typography>
                  ) : (
                    <List dense disablePadding>
                      {members.map((m, idx) => (
                        <ListItem key={m.id || idx} sx={{ px: 0.5 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 30, height: 30, bgcolor: colorFrom(m.nickname || m.email || '') }}>
                              {(m.nickname && m.nickname[0]) || (m.email && m.email[0]) || '?'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontWeight: 600 }}>{m.nickname || '이름 없음'}</Typography>
                              {m.role && (
                                <Chip size="small" label={m.role === 'owner' ? '관리자' : m.role} color={m.role === 'owner' ? 'primary' : 'default'} variant={m.role === 'owner' ? 'filled' : 'outlined'} sx={{ height: 20 }} />
                              )}
                            </Box>}
                            secondary={<Typography sx={{ color: 'text.secondary' }}>{m.email || m.username || ''}</Typography>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>

              {/* 채널 리스트 */}
              <Grid item xs={12} md={12}>
                <Paper elevation={0} sx={{ width: '100%', p: { xs: 2, md: 2.5 }, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ForumRoundedIcon sx={{ color: 'secondary.main' }} />
                      <Typography variant="h6" fontWeight={800}>채널</Typography>
                    </Box>
                    <Chip size="small" label={`${channels.length}개`} sx={{ bgcolor: 'grey.100' }} />
                  </Box>
                  {channels.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary' }}>채널이 없습니다.</Typography>
                  ) : (
                    <List dense disablePadding>
                      {channels.map((c, idx) => (
                        <ListItem key={c.id || c.channelId || idx} sx={{ px: 0.5 }}>
                          <ListItemText
                            primary={<Typography sx={{ fontWeight: 600 }}>{c.name || c.title || '채널'}</Typography>}
                            secondary={<Typography sx={{ color: 'text.secondary' }}>{c.description || ''}</Typography>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
}

export default WorkspaceSettings;
