import React, {useState, useEffect, useRef} from 'react';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    Box,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import api from '@/api/api.js';

// StompJs 클라이언트 설정
const stompConfig = {
    webSocketFactory: () => new SockJS('http://localhost:8080/ws-stomp'),
    reconnectDelay: 5000,
    debug: (str) => console.log(new Date(), str),
};

/**
 * 워크스페이스/채널 기반 채팅 컴포넌트
 * @param {{ workspaceId: number, channelId: number, currentUser: { id: string, name: string } }} props
 */
function ChannelChat({workspaceId, channelId, currentUser}) {
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const stompClient = useRef(null);

    // 1. conversationId를 가져오는 useEffect
    useEffect(() => {
        if (!workspaceId || !channelId) return;

        setLoading(true);
        setError('');
        api.get('/api/chat/conversation', {
            params: {workspaceId, channelId}
        })
            .then(res => {
                setConversationId(res.data.conversationId);
            })
            .catch(() => {
                setError("채팅방 정보를 가져오는 데 실패했습니다.");
            })
            .finally(() => {
                setLoading(false);
            });

    }, [workspaceId, channelId]);

    // 2. conversationId를 받은 후 웹소켓을 연결하는 useEffect
    useEffect(() => {
        if (!conversationId) return;

        stompClient.current = new Client(stompConfig);

        stompClient.current.onConnect = () => {
            console.log('STOMP Connected!');

            // 채팅방 구독
            stompClient.current.subscribe(`/topic/chat/room/${conversationId}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages((prev) => [...prev, receivedMessage]);
            });

            // JOIN 메시지 발행
            stompClient.current.publish({
                destination: '/pub/chat/join',
                body: JSON.stringify({roomId: conversationId, sender: currentUser.name}),
            });
        };

        stompClient.current.activate();

        return () => {
            if (stompClient.current?.connected) {
                stompClient.current.deactivate();
                console.log('STOMP Disconnected.');
            }
        };
    }, [conversationId, currentUser.name]);

    const handleSend = () => {
        if (input.trim() && stompClient.current?.connected) {
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

    if (loading) return <Box p={4} textAlign="center"><CircularProgress/></Box>;
    if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;

    return (
        <Paper elevation={3} sx={{p: 2, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column'}}>
            <Typography variant="h6" gutterBottom>
                Channel: {channelId}
            </Typography>
            <Box component={Paper} sx={{flexGrow: 1, overflowY: 'auto', p: 2, mb: 2, backgroundColor: '#f5f5f5'}}>
                <List>
                    {messages.map((msg, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={msg.content}
                                secondary={`${msg.sender} - ${new Date(msg.timestamp).toLocaleTimeString()}`}
                                sx={{
                                    textAlign: msg.sender === currentUser.name ? 'right' : 'left',
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Box sx={{display: 'flex'}}>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="메시지를 입력하세요..."
                />
                <Button variant="contained" onClick={handleSend} sx={{ml: 1}}>
                    전송
                </Button>
            </Box>
        </Paper>
    );
}

export default ChannelChat;
