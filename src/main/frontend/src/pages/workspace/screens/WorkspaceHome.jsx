import React, {useEffect, useState} from 'react';
import {
    Box, Button, CircularProgress, Typography, List, ListItem, ListItemButton, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useParams} from 'react-router-dom';
import ChannelChat from '@/pages/workspace/components/ChannelChat.jsx';
import ChannelCard from '@/pages/workspace/components/ChannelCard.jsx';
import ChannelsDialog from '@/pages/workspace/components/ChannelsDialog.jsx';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function WorkspaceHome({workspace: parentWorkspace, parentWorkspaceLoading = false}) {
    const {roomId} = useParams();
    const [loading, setLoading] = useState(parentWorkspaceLoading);
    const [error, setError] = useState(null);
    const [workspace, setWorkspace] = useState(parentWorkspace || null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [showMore, setShowMore] = useState(false);
    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        let timeoutId = null;
        if (parentWorkspaceLoading) {
            setLoading(true);
            setError(null);
            timeoutId = setTimeout(() => {
                setLoading(false);
                setError('워크스페이스 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
            }, 5000);
        }

        if (parentWorkspace) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            setWorkspace(parentWorkspace);
            setError(null);
            setLoading(false);
            if (parentWorkspace?.channels && parentWorkspace.channels.length > 0) {
                setSelectedChannel(parentWorkspace.channels[0]);
            }
            return () => {
                if (timeoutId) clearTimeout(timeoutId);
            };
        }

        if (!roomId) {
            setError('워크스페이스 ID가 없습니다.');
        } else {
            setError('워크스페이스 정보를 로드할 수 없습니다. 새로고침 해주세요.');
        }
        setWorkspace(null);
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
    }, [parentWorkspaceLoading, parentWorkspace, roomId]);

    if (loading) return (<Box sx={{p: 4, display: 'flex', justifyContent: 'center'}}>
            <CircularProgress/>
        </Box>);

    if (error) return (<Box sx={{p: 4}}>
            <Typography variant="h6" gutterBottom>오류</Typography>
            <Typography color="error">{error}</Typography>
            <Box sx={{mt: 2}}>
                <Button variant="contained" onClick={() => window.location.reload()}>다시 시도</Button>
            </Box>
        </Box>);

    const channels = workspace?.channels || [];
    const primary = channels.slice(0, 3);
    const others = channels.slice(3);

    return (<Box sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            height: 'calc(100vh - 100px)',
            boxSizing: 'border-box',
            overflow: 'hidden'
        }}>
            {/* 워크스페이스 이름 영역 */}
            <Box>
                <Typography variant="h5">
                    {workspace?.workspaceName || `워크스페이스 #${roomId}`}
                </Typography>
            </Box>

            {/* 채널리스트 영역 */}
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                {channels.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">활성 채널이 없습니다.</Typography>) : (<>
                        <List sx={{display: 'flex', flexDirection: 'row', gap: 1, overflowX: 'auto'}}>
                            {primary.map((ch) => (<ChannelCard
                                    key={ch.channelId}
                                    ch={ch}
                                    selected={selectedChannel?.channelId === ch.channelId}
                                    onSelect={(c) => setSelectedChannel(c)}
                                    isMobile={isMobile}
                                />))}
                            {others.length > 0 && (<ListItem disablePadding>
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
                                </ListItem>)}
                        </List>

                        <ChannelsDialog open={showMore} onClose={() => setShowMore(false)} channels={channels}
                                        onSelect={(c) => setSelectedChannel(c)} selectedChannel={selectedChannel}/>

                    </>)}
            </Box>

            {/* 채팅창 영역 */}
            <Box sx={{
                flex: 1,
                minHeight: 0,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgb(145 145 145 / 14%)',
                overflow: 'hidden'
            }}>
                <ChannelChat
                    workspaceId={workspace?.workspaceId}
                    channelId={selectedChannel?.channelId}
                />
            </Box>
        </Box>);
}
