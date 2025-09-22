import React, {useEffect, useState} from 'react';
import {Box, Typography} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';
import api from '../../api/api';
import {useAuth} from '../../contexts/AuthContext.jsx';
import WorkspaceHeader from './components/Header.jsx';
import ChannelList from './components/ChannelList.jsx';
import ChatHistory from './components/ChatHistory.jsx';
import ChatInput from './components/ChatInput.jsx';

function Workspace() {
    const navigate = useNavigate();
    const {roomId} = useParams();
    const [, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [workspace, setWorkspace] = useState(null);
    const {loading: authLoading, guard} = useAuth();

    useEffect(() => {
        if (!authLoading) {
            guard(true, '/');
        }
    }, [authLoading, guard]);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        api
            .get(`/v1/workspace/${roomId}`)
            .then((res) => {
                if (!mounted) return;
                setWorkspace(res.data || null);
                setLoading(false);
            })
            .catch(() => {
                if (!mounted) return;
                setError('워크스페이스 정보를 불러오지 못했습니다.');
                setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [roomId]);

    // 더미 채널/채팅 데이터
    const dummyChannels = [
        { id: 'c1', name: '일반', description: '팀 공지와 일상 소통' },
        { id: 'c2', name: '개발', description: '개발 관련 논의' },
        { id: 'c3', name: '디자인', description: '디자인팀 채널' },
    ];
    const [channels] = useState(dummyChannels);
    const [selectedChannelId, setSelectedChannelId] = useState(dummyChannels[0].id);
    const [messages, setMessages] = useState([
        { user: '홍길동', text: '안녕하세요!', time: '09:00' },
        { user: '김영희', text: '반갑습니다.', time: '09:01' },
    ]);

    // 채널 추가/설정 핸들러 (더미)
    const handleAddChannel = () => alert('채널 추가 기능');
    const handleChannelSettings = () => alert('채널 설정 기능');
    const handleSelectChannel = (id) => {
        setSelectedChannelId(id);
        // 실제 구현 시 해당 채널의 메시지 불러오기 필요
        setMessages([
            { user: '홍길동', text: `${channels.find(c => c.id === id)?.name} 채널에 입장했습니다.`, time: '09:10' }
        ]);
    };
    const handleSendMessage = (msg) => {
        setMessages(prev => [...prev, { user: '나', text: msg, time: new Date().toLocaleTimeString().slice(0,5) }]);
    };

    return (
        <Box component="main" sx={{
            minHeight: '100vh',
            height: '100vh', // 추가: 전체 뷰포트 높이 고정
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#f8f9fa',
            pt: 0,
        }}>
            <WorkspaceHeader channelName={workspace?.name || `워크스페이스 #${roomId}`} onExit={() => navigate('/')} />
            <Box sx={{
                width: '100%',
                maxWidth: 1200,
                px: 2,
                py: 2,
                flex: 1,
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', md: 'row' },
                height: { md: 'calc(100vh - 64px)' },
                minHeight: 0,
            }}>
                {/* 채널 리스트 */}
                <ChannelList
                    channels={channels}
                    selectedChannelId={selectedChannelId}
                    onSelect={handleSelectChannel}
                    onAdd={handleAddChannel}
                    onSettings={handleChannelSettings}
                />
                {/* 채팅 영역 */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <ChatHistory messages={messages} />
                    <ChatInput onSend={handleSendMessage} />
                </Box>
            </Box>
        </Box>
    );
}

export default Workspace;
