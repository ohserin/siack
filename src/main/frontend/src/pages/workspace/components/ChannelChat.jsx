import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import api from '@/api/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { getCookie } from '@/utils/cookie.js';

/**
 * 워크스페이스/채널 기반 채팅 컴포넌트
 * @param {{ workspaceId: number, channelId: number }} props
 */
function ChannelChat({ workspaceId, channelId }) {
    const { userData, loading: userLoading } = useAuth();
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const stompClient = useRef(null);

    useEffect(() => {
        if (!workspaceId || !channelId) return;

        setLoading(true);
        setError('');
        api.get('/chat/conversation', {
            params: { workspaceId, channelId }
        })
        .then(res => {
            const newConversationId = res.data.conversationId;
            setConversationId(newConversationId);
            // conversationId로 이전 대화 내역을 조회
            return api.get(`/chat/conversations/${newConversationId}/messages`);
        })
        .then(res => {
            setMessages(res.data);
        })
        .catch(() => {
            setError("채팅방 정보를 가져오거나 대화 내역을 불러오는 데 실패했습니다.");
        })
        .finally(() => {
            setLoading(false);
        });

    }, [workspaceId, channelId]);

    // conversationId와 userData가 모두 준비된 후 웹소켓을 연결합니다.
    useEffect(() => {
        if (!conversationId || !userData) return;

        const DEFAULT_BASE = import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:8080';
        const baseURL = import.meta.env.VITE_API_BASE || DEFAULT_BASE;
        const socketUrl = `${baseURL}/ws`;

        // STOMP 클라이언트 설정을 내부로 이동하여 동적 토큰 적용
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            connectHeaders: {
                // 쿠키에서 토큰을 가져와 헤더에 추가 (api.js와 동일 방식)
                Authorization: `Bearer ${getCookie('authToken')}`,
            },
            reconnectDelay: 5000,
            debug: (str) => console.log(new Date(), str),
            onConnect: () => {
                client.subscribe(`/topic/chat/rooms/${conversationId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    setMessages((prev) => [...prev, receivedMessage]);
                });

                client.publish({
                    destination: `/siack/chat/${conversationId}/join`,
                    body: JSON.stringify({ roomId: conversationId, sender: userData.username }),
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        stompClient.current = client;
        client.activate();

        return () => {
            if (client.connected) {
                client.deactivate();
                console.log('STOMP Disconnected.');
            }
        };
    }, [conversationId, userData]);

    const handleSend = () => {
        if (input.trim() && stompClient.current?.connected && userData) {
            const chatMessage = {
                roomId: conversationId,
                sender: userData.userid,
                content: input,
                type: 'CHAT',
            };
            stompClient.current.publish({
                destination: `/siack/chat/${conversationId}/send`,
                body: JSON.stringify(chatMessage),
            });
            setInput('');
        }
    };

    // userData가 로딩 중일 때를 위한 UI 처리
    if (userLoading) {
        return <Box p={4} textAlign="center"><Alert severity="info">사용자 정보를 불러오는 중입니다...</Alert></Box>;
    }

    // 채널이 선택되지 않았을 때 안내 메시지 표시
    if (!workspaceId || !channelId) {
        return <Box p={4} textAlign="center"><Typography variant="body1" color="textSecondary">채널을 선택해주세요.</Typography></Box>;
    }

    if (loading) return <Box p={4} textAlign="center"><CircularProgress /></Box>;
    if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;

    return (
        <Paper elevation={3} sx={{ p: 2, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
                Channel: {channelId}
            </Typography>
            <Box component={Paper} sx={{ flexGrow: 1, overflowY: 'auto', p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                <List>
                    {messages.map((msg, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={msg.content}
                                // [수정] senderName을 우선 사용하고, 없으면 sender ID를 표시합니다.
                                secondary={`${msg.senderName || msg.sender} - ${new Date(msg.timestamp).toLocaleTimeString()}`}
                                sx={{
                                    // [수정] 메시지 정렬 기준을 userData.userid로 변경
                                    textAlign: msg.sender === userData.userid ? 'right' : 'left',
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Box sx={{ display: 'flex' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="메시지를 입력하세요..."
                />
                <Button variant="contained" onClick={handleSend} sx={{ ml: 1 }}>
                    전송
                </Button>
            </Box>
        </Paper>
    );
}

export default ChannelChat;