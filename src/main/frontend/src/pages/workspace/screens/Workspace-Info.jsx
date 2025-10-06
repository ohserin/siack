import React, {useEffect, useMemo, useState} from 'react';
import {
    Box, Typography, Divider, Avatar, Chip, Button, Stack, List, ListItem, ListItemText, Skeleton, Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {useParams} from 'react-router-dom';
import api from '../../../api/api.js';

function WorkspaceInfo() {
    const {roomId} = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError('');
        api.get(`/v1/workspace/${roomId}/info`)
            .then((res) => {
                if (!mounted) return;
                const body = res.data || null;
                if (!body || (typeof body.statusCode === 'number' && body.statusCode !== 200)) {
                    setError(body?.message || '워크스페이스 정보를 불러오지 못했습니다.');
                    setData(null);
                } else {
                    setData(body);
                }
            })
            .catch(() => {
                if (!mounted) return;
                setError('워크스페이스 정보를 불러오지 못했습니다.');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });
        return () => { mounted = false; };
    }, [roomId]);

    // API 응답 -> 화면 표시용 맵핑
    const vm = useMemo(() => {
        if (!data) return null;

        const translateRole = (role) => {
            switch (role) {
                case 'OWNER': return '소유자';
                case 'ADMIN': return '관리자';
                case 'MEMBER': return '멤버';
                default: return '-';
            }
        };

        return {
            name: data.workspaceName || `워크스페이스 #${data.workspaceId || roomId}`,
            description: data.workspaceDesc || '-',
            createdAt: data.createDate || '-',
            owner: data.ownerName || '-',
            memberCount: data.memberCount ?? 0,
            channelCount: data.channelCount ?? 0,
            status: '활성',
            iconUrl: undefined,
            inviteCode: '-',
            members: Array.isArray(data.users) ? data.users.map(u => ({
                id: u.id,
                name: u.nickname || '?',
                avatar: u.profileImageUrl || undefined, // 서버 제공 URL만 사용
            })) : [],
            plan: data.planName || 'Free',
            storage: { used: (data.usedStorage ?? 0) + ' MB', total: '-' },
            notice: [],
            myRole: translateRole(data.userRole),
        };
    }, [data, roomId]);

    if (loading) {
        return (
            <Box sx={{mt: 3, mb: 5, p: 2}}>
                <Skeleton variant="rectangular" height={80} sx={{mb: 2}}/>
                <Skeleton height={28} width="60%"/>
                <Skeleton height={28} width="40%"/>
                <Skeleton variant="rectangular" height={200} sx={{mt: 2}}/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{mt: 3, mb: 5, p: 2}}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!vm) return null;

    return (
        <Box sx={{mt: 3, mb: 5, p: 2}}>
            {/* 상단: 아이콘, 이름, 상태, 초대코드 */}
            <Box display="flex" alignItems="center" mb={2}>
                <Avatar src={vm.iconUrl} sx={{width: 56, height: 56, mr: 2}}>{vm.name?.[0] || 'W'}</Avatar>
                <Box>
                    <Typography variant="h5" fontWeight={700}>{vm.name}</Typography>
                    <Chip label={vm.status} color={vm.status === '활성' ? 'success' : 'default'}
                          size="small" sx={{mt: 0.5}}/>
                </Box>
                <Box flex={1}/>
                <Button variant="outlined" size="small" startIcon={<ContentCopyIcon/>} sx={{ml: 2}}
                        onClick={() => navigator.clipboard.writeText(String(vm.inviteCode || ''))}>
                    초대코드: {vm.inviteCode}
                </Button>
            </Box>
            <Divider sx={{mb: 3}}/>
            {/* 정보 그리드 */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)'},
                    gap: 2,
                    mb: 2,
                }}
            >
                <Box><Typography>설명: {vm.description}</Typography></Box>
                <Box><Typography>생성일: {vm.createdAt}</Typography></Box>
                <Box><Typography>소유자: {vm.owner}</Typography></Box>
                <Box><Typography>내 역할: {vm.myRole}</Typography></Box>
                <Box><Typography>플랜: {vm.plan}</Typography></Box>
                <Box><Typography>저장소: {vm.storage.used} / {vm.storage.total}</Typography></Box>
                <Box><Typography>멤버 수: {vm.memberCount}명</Typography></Box>
                <Box><Typography>채널 수: {vm.channelCount}개</Typography></Box>
            </Box>
            {/* 멤버 리스트 */}
            <Box mb={2}>
                <Typography fontWeight={600} mb={1}>대표 멤버</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    {vm.members.slice(0, 8).map(m => (
                        <Avatar key={m.id || m.name} src={m.avatar}>{m.name?.[0] || '?'}</Avatar>
                    ))}
                    {vm.members.length > 8 && <Button size="small">전체보기</Button>}
                </Stack>
            </Box>
            <Divider sx={{mb: 2}}/>
            {/* 공지사항 */}
            <Box>
                <Typography fontWeight={600} mb={1}>공지사항</Typography>
                {(!vm.notice || vm.notice.length === 0) ? (
                    <Typography color="text.secondary">공지사항이 없습니다.</Typography>
                ) : (
                    <List dense>
                        {vm.notice.map(n => (
                            <ListItem key={n.title} disablePadding>
                                <ListItemText primary={n.title} secondary={n.date}/>
                            </ListItem>
                        ))}
                    </List>
                )}
                <Button size="small">더보기</Button>
            </Box>
        </Box>
    );
}

export default WorkspaceInfo;
