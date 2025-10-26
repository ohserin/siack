import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    List,
    ListItem,
    ListItemButton,
    IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useParams} from 'react-router-dom';
import ChannelChat from '@/pages/workspace/components/ChannelChat.jsx';
import ChannelCard from '@/pages/workspace/components/ChannelCard.jsx';
import ChannelsDialog from '@/pages/workspace/components/ChannelsDialog.jsx';
import useMediaQuery from '@mui/material/useMediaQuery';
import api from '@/api/api.js';

export default function WorkspaceHome() {
    const {roomId} = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [showMore, setShowMore] = useState(false);
    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        let mounted = true;
        if (!roomId) {
            setError('워크스페이스 ID가 없습니다.');
            setLoading(false);
            return () => {
                mounted = false;
            };
        }

        setLoading(true);
        setError(null);

        api.get(`/v1/workspace/${roomId}/info`)
            .then((res) => {
                if (!mounted) return;
                const body = res.data || null;
                if (!body || (typeof body.statusCode === 'number' && body.statusCode !== 200)) {
                    setError(body?.message || '워크스페이스 정보를 불러오지 못했습니다.');
                    setWorkspace(null);
                } else {
                    setWorkspace(body);
                    if (body?.channels && body.channels.length > 0) {
                        setSelectedChannel(body.channels[0]);
                    }
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

        return () => {
            mounted = false;
        };
    }, [roomId]);

    // --- 렌더링 ---
    if (loading) return (
        <Box sx={{p: 4, display: 'flex', justifyContent: 'center'}}>
            <CircularProgress/>
        </Box>
    );

    if (error) return (
        <Box sx={{p: 4}}>
            <Typography variant="h6" gutterBottom>오류</Typography>
            <Typography color="error">{error}</Typography>
            <Box sx={{mt: 2}}>
                <Button variant="contained" onClick={() => window.location.reload()}>다시 시도</Button>
            </Box>
        </Box>
    );

    const channels = workspace?.channels || [];
    const primary = channels.slice(0, 3);
    const others = channels.slice(3);

    return (
        <Box sx={{p: 2, display: 'flex', flexDirection: 'column', gap: 1, height: '100%'}}>
            {/* 워크스페이스 이름 영역 */}
            <Box>
                <Typography variant="h5">
                    {workspace?.workspaceName || `워크스페이스 #${roomId}`}
                </Typography>
            </Box>

            {/* 채널리스트 영역 */}
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                {channels.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">활성 채널이 없습니다.</Typography>
                ) : (
                    <>
                        <List sx={{display: 'flex', flexDirection: 'row', gap: 1, overflowX: 'auto'}}>
                            {primary.map((ch) => (
                                <ChannelCard
                                    key={ch.channelId}
                                    ch={ch}
                                    selected={selectedChannel?.channelId === ch.channelId}
                                    onSelect={(c) => setSelectedChannel(c)}
                                    isMobile={isMobile}
                                />
                            ))}
                            {others.length > 0 && (
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => setShowMore(true)} sx={{
                                        borderRadius: 2,
                                        bgcolor: 'common.white',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <Typography sx={{fontWeight: 700}}>더보기</Typography>
                                            <IconButton size="small" aria-label="더보기"><ExpandMoreIcon/></IconButton>
                                            <Typography variant="caption"
                                                        color="text.secondary">{`+${others.length}`}</Typography>
                                        </Box>
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </List>

                        <ChannelsDialog open={showMore} onClose={() => setShowMore(false)} channels={channels}
                                        onSelect={(c) => setSelectedChannel(c)} selectedChannel={selectedChannel}/>
                    </>
                )}
            </Box>

            {/* 채팅창 영역 */}
            <Box sx={{
                height: '100%',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgb(145 145 145 / 14%)'
            }}>
                <ChannelChat channel={selectedChannel}/>
            </Box>
        </Box>
    );
}
