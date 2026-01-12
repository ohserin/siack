import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    Box, IconButton, InputAdornment, Typography, Avatar, Chip, OutlinedInput, CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import api from '@/api/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { getCookie } from '@/utils/cookie.js';

// --- Styles ---
const STYLES = {
    chatContainer: {
        display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', bgcolor: 'background.default'
    },
    header: { px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' },
    messageList: { flex: 1, overflowY: 'auto', py: 2, bgcolor: '#f7f8fa' },
    inputArea: { p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' },
    emptyState: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' },
    bubbleWrapper: (isMine) => ({
        display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', px: 2, mb: 1.5
    }),
    bubbleContent: (isMine) => ({
        display: 'flex', maxWidth: '75%', gap: 1, flexDirection: isMine ? 'row-reverse' : 'row'
    }),
    messageBox: (isMine) => ({
        px: 1.5, py: 1, borderRadius: 2,
        bgcolor: isMine ? 'primary.main' : 'background.paper',
        color: isMine ? 'primary.contrastText' : 'text.primary',
        boxShadow: isMine ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
        border: isMine ? 'none' : '1px solid',
        borderColor: 'divider',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    }),
    dateDivider: { display: 'flex', justifyContent: 'center', my: 3 }
};

// --- Sub-Components ---
const MessageBubble = React.memo(({ meId, msg }) => {
    const isMine = String(msg.sender) === String(meId);

    return (
        <Box sx={STYLES.bubbleWrapper(isMine)}>
            <Box sx={STYLES.bubbleContent(isMine)}>
                {!isMine && (
                    <Avatar src={msg.profileImageUrl} sx={{ width: 32, height: 32, bgcolor: '#e0e0e0', fontSize: '0.875rem' }}>
                        {msg.nickname?.[0] || '?'}
                    </Avatar>
                )}
                <Box>
                    {!isMine && (
                        <Typography variant="caption" sx={{ ml: 0.5, mb: 0.5, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                            {msg.nickname || '알 수 없음'}
                        </Typography>
                    )}
                    <Box sx={STYLES.messageBox(isMine)}>
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.content}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.25, color: 'text.disabled', textAlign: isMine ? 'right' : 'left' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
});

// --- Main Component ---
function ChannelChat({ workspaceId, channelId }) {
    const { userData, loading: userLoading } = useAuth();
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const stompClient = useRef(null);
    const scrollRef = useRef(null);

    // 메시지 데이터 가공 (정렬 및 날짜 구분선 추가)
    const processedElements = useMemo(() => {
        const sorted = [...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const elements = [];
        let lastDate = null;
        const todayStr = new Date().toLocaleDateString('ko-KR');

        sorted.forEach((msg, idx) => {
            const dateStr = new Date(msg.timestamp).toLocaleDateString('ko-KR');
            if (dateStr !== lastDate) {
                const label = dateStr === todayStr ? "오늘" :
                    new Date(msg.timestamp).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

                elements.push({ type: 'date-divider', label, key: `date-${dateStr}` });
                lastDate = dateStr;
            }
            elements.push({ type: 'message', data: msg, key: msg.id || `msg-${idx}` });
        });
        return elements;
    }, [messages]);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [processedElements, scrollToBottom]);

    // 1. 초기 데이터 로딩 (Conversation 및 내역)
    useEffect(() => {
        if (!workspaceId || !channelId) return;

        const initChat = async () => {
            setLoading(true);
            try {
                const { data: conv } = await api.get('/chat/conversation', { params: { workspaceId, channelId } });
                setConversationId(conv.conversationId);

                const { data: history } = await api.get(`/chat/conversations/${conv.conversationId}/messages`);
                setMessages(history);
            } catch (err) {
                console.error("채팅 데이터를 불러오는데 실패했습니다:", err);
            } finally {
                setLoading(false);
            }
        };

        initChat();
    }, [workspaceId, channelId]);

    // 2. WebSocket 연결 설정
    useEffect(() => {
        if (!conversationId || !userData) return;

        const baseURL = import.meta.env.VITE_API_BASE || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:8080');

        const client = new Client({
            webSocketFactory: () => new SockJS(`${baseURL}/ws`),
            connectHeaders: { Authorization: `Bearer ${getCookie('authToken')}` },
            onConnect: () => {
                // 메시지 구독
                client.subscribe(`/topic/chat/rooms/${conversationId}`, (message) => {
                    const payload = JSON.parse(message.body);
                    if (payload.type === 'CHAT') {
                        setMessages(prev => [...prev, payload]);
                    }
                });

                // 입장 알림 발송
                client.publish({
                    destination: `/siack/chat/${conversationId}/join`,
                    body: JSON.stringify({ roomId: conversationId, sender: userData.userid, nickname: userData.nickname }),
                });
            },
            onStompError: (frame) => console.error('STOMP Error:', frame.headers['message'])
        });

        stompClient.current = client;
        client.activate();

        return () => {
            if (stompClient.current) stompClient.current.deactivate();
        };
    }, [conversationId, userData]);

    const handleSend = () => {
        const text = input.trim();
        if (!text || !stompClient.current?.connected || !userData) return;

        const payload = {
            roomId: conversationId,
            sender: userData.userid,
            nickname: userData.nickname,
            profileImageUrl: userData.profileImageUrl,
            content: text,
            type: 'CHAT',
            timestamp: new Date().toISOString()
        };

        stompClient.current.publish({
            destination: `/siack/chat/${conversationId}/send`,
            body: JSON.stringify(payload),
        });
        setInput('');
    };

    if (userLoading || loading) {
        return <Box p={4} textAlign="center"><CircularProgress size={24} /></Box>;
    }

    return (
        <Box sx={STYLES.chatContainer}>
            <Box sx={STYLES.header}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}># 일반</Typography>
            </Box>

            <Box ref={scrollRef} sx={STYLES.messageList}>
                {processedElements.length > 0 ? (
                    processedElements.map((el) =>
                        el.type === 'date-divider' ? (
                            <Box key={el.key} sx={STYLES.dateDivider}>
                                <Chip size="small" label={el.label} variant="outlined"
                                      sx={{ fontSize: '0.75rem', height: 24, bgcolor: 'background.paper', color: 'text.secondary', fontWeight: 600 }} />
                            </Box>
                        ) : (
                            <MessageBubble key={el.key} meId={userData.userid} msg={el.data} />
                        )
                    )
                ) : (
                    <Box sx={STYLES.emptyState}>메시지가 없습니다.</Box>
                )}
            </Box>

            <Box sx={STYLES.inputArea}>
                <OutlinedInput
                    fullWidth multiline maxRows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
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