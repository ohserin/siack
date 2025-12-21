import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    Box, IconButton, InputAdornment, Tooltip, Typography,
    Avatar, Chip, OutlinedInput, CircularProgress, Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import api from '@/api/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { getCookie } from '@/utils/cookie.js';

/**
 * 말풍선 컴포넌트 - 닉네임 및 프로필 이미지 적용
 */
function MessageBubble({ meId, msg }) {
    // msg.sender가 숫자형 id일 경우를 대비해 == 사용 혹은 타입 확인
    const isMine = String(msg.sender) === String(meId);

    return (
        <Box sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', px: 2, mb: 1.5 }}>
            <Box sx={{ display: 'flex', maxWidth: '75%', gap: 1, flexDirection: isMine ? 'row-reverse' : 'row' }}>
                {!isMine && (
                    <Avatar
                        src={msg.profileImageUrl} // 프로필 이미지 URL 적용
                        sx={{ width: 32, height: 32, bgcolor: '#e0e0e0', fontSize: '0.875rem' }}
                    >
                        {/* 이미지 로드 실패 시 닉네임 첫 글자 표시 */}
                        {msg.nickname?.[0] || '?'}
                    </Avatar>
                )}
                <Box>
                    {!isMine && (
                        <Typography variant="caption" sx={{ ml: 0.5, mb: 0.5, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                            {msg.nickname || '알 수 없음'}
                        </Typography>
                    )}
                    <Box
                        sx={{
                            px: 1.5,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: isMine ? 'primary.main' : 'background.paper',
                            color: isMine ? 'primary.contrastText' : 'text.primary',
                            boxShadow: isMine ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                            border: isMine ? 'none' : '1px solid',
                            borderColor: 'divider',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.content}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.25, color: 'text.disabled', textAlign: isMine ? 'right' : 'left' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

function ChannelChat({ workspaceId, channelId }) {
    const { userData, loading: userLoading } = useAuth(); // userData에 nickname, profileImageUrl 포함됨
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const stompClient = useRef(null);
    const scrollRef = useRef(null);

    // 자동 스크롤
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // 대화방 정보 로드
    useEffect(() => {
        if (!workspaceId || !channelId) return;
        setLoading(true);
        api.get('/chat/conversation', { params: { workspaceId, channelId } })
            .then(res => {
                const newConversationId = res.data.conversationId;
                setConversationId(newConversationId);
                return api.get(`/chat/conversations/${newConversationId}/messages`);
            })
            .then(res => setMessages(res.data))
            .catch(err => console.error("데이터 로드 실패:", err))
            .finally(() => setLoading(false));
    }, [workspaceId, channelId]);

    // WebSocket 연결
    useEffect(() => {
        if (!conversationId || !userData) return;

        const baseURL = import.meta.env.VITE_API_BASE || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:8080');
        const socketUrl = `${baseURL}/ws`;

        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            connectHeaders: { Authorization: `Bearer ${getCookie('authToken')}` },
            onConnect: () => {
                client.subscribe(`/topic/chat/rooms/${conversationId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    setMessages((prev) => [...prev, receivedMessage]);
                });
                // 입장 시에도 nickname 전달
                client.publish({
                    destination: `/siack/chat/${conversationId}/join`,
                    body: JSON.stringify({
                        roomId: conversationId,
                        sender: userData.userid,
                        nickname: userData.nickname
                    }),
                });
            },
        });

        stompClient.current = client;
        client.activate();
        return () => { if (client.connected) client.deactivate(); };
    }, [conversationId, userData]);

    const handleSend = () => {
        if (input.trim() && stompClient.current?.connected && userData) {
            const chatMessage = {
                roomId: conversationId,
                sender: userData.userid,
                nickname: userData.nickname, // 전송 시 nickname 포함
                profileImageUrl: userData.profileImageUrl, // 전송 시 프로필 이미지 포함
                content: input,
                type: 'CHAT',
                timestamp: new Date().toISOString()
            };
            stompClient.current.publish({
                destination: `/siack/chat/${conversationId}/send`,
                body: JSON.stringify(chatMessage),
            });
            setInput('');
        }
    };

    if (userLoading || loading) return <Box p={4} textAlign="center"><CircularProgress size={24} /></Box>;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}># 채널 대화</Typography>
            </Box>

            <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', py: 2, bgcolor: '#f7f8fa' }}>
                {messages.length > 0 ? (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Chip size="small" label="오늘" variant="outlined" sx={{ fontSize: '0.75rem', height: 20 }} />
                        </Box>
                        {messages.map((msg, idx) => (
                            <MessageBubble key={idx} meId={userData.userid} msg={msg} />
                        ))}
                    </>
                ) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                        메시지가 없습니다.
                    </Box>
                )}
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <OutlinedInput
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    fullWidth
                    multiline
                    placeholder={`${userData?.nickname}님으로 메시지 보내기...`}
                    sx={{ borderRadius: 1.5, bgcolor: '#fff' }}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton color="primary" onClick={handleSend} disabled={!input.trim()}>
                                <SendIcon />
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </Box>
        </Box>
    );
}

export default ChannelChat;