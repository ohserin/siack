import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import api from '@/api/api.js';

const stompConfig = {
    webSocketFactory: () => new SockJS('http://localhost:8080/ws-stomp'),
    reconnectDelay: 5000,
    debug: (str) => console.log(new Date(), str),
};

/**
 * 워크스페이스/채널 기반 채팅 컴포넌트
 * @param {{ workspaceId: number, channelId: number, currentUser: { id: string, name: string } }} props
 */
function ChannelChat({ workspaceId, channelId, currentUser }) {
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const stompClient = useRef(null);

    useEffect(() => {
        if (!workspaceId || !channelId) return;

        setLoading(true);
        setError('');
        // 1. conversationId를 가져옵니다.
        api.get('/chat/conversation', {
            params: { workspaceId, channelId }
        })
        .then(res => {
            const newConversationId = res.data.conversationId;
            setConversationId(newConversationId);
            // 2. [개선] conversationId로 이전 대화 내역을 조회합니다.
            return api.get(`/chat/conversations/${newConversationId}/messages`);
        })
        .then(res => {
            // 3. [개선] 가져온 대화 내역으로 messages 상태를 초기화합니다.
            setMessages(res.data);
        })
        .catch(() => {
            setError("채팅방 정보를 가져오거나 대화 내역을 불러오는 데 실패했습니다.");
        })
        .finally(() => {
            setLoading(false);
        });

    }, [workspaceId, channelId]);

    // conversationId와 currentUser가 모두 준비된 후 웹소켓을 연결합니다.
    useEffect(() => {
        // currentUser나 conversationId가 없으면 연결을 시도하지 않습니다.
        if (!conversationId || !currentUser) return;

        stompClient.current = new Client(stompConfig);

        stompClient.current.onConnect = () => {
            console.log('STOMP Connected!');
            
            stompClient.current.subscribe(`/topic/chat/room/${conversationId}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages((prev) => [...prev, receivedMessage]);
            });

            // currentUser가 확실히 존재할 때만 publish를 호출합니다.
            stompClient.current.publish({
                destination: '/pub/chat/join',
                body: JSON.stringify({ roomId: conversationId, sender: currentUser.name }),
            });
        };

        stompClient.current.activate();

        return () => {
            if (stompClient.current?.connected) {
                stompClient.current.deactivate();
                console.log('STOMP Disconnected.');
            }
        };
    // [수정] 의존성 배열에 currentUser.name 대신 currentUser 객체 전체를 추가합니다.
    }, [conversationId, currentUser]);

    const handleSend = () => {
        // [수정] currentUser가 없을 경우를 대비한 방어 코드 추가
        if (input.trim() && stompClient.current?.connected && currentUser) {
            const chatMessage = {
                roomId: conversationId,
                sender: currentUser.id,
                content: input,
                type: 'CHAT',
            };
            stompClient.current.publish({
                destination: '/pub/chat/message',
                body: JSON.stringify(chatMessage),
            });
            setInput('');
        }
    };

    // [수정] currentUser가 로딩 중일 때를 위한 UI 처리
    if (!currentUser) {
        return <Box p={4} textAlign="center"><Alert severity="info">사용자 정보를 불러오는 중입니다...</Alert></Box>;
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
                                    // [수정] 메시지 정렬 기준을 currentUser.id로 변경
                                    textAlign: msg.sender === currentUser.id ? 'right' : 'left',
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
