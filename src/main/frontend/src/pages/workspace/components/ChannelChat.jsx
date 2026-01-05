import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    Box, IconButton, InputAdornment, Typography, Avatar, Chip, OutlinedInput, CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import api from '@/api/api.js';
import {useAuth} from '@/contexts/AuthContext.jsx';
import {getCookie} from '@/utils/cookie.js';

const STYLES = {
    chatContainer: {
        display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', bgcolor: 'background.default'
    },
    header: {px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper'},
    messageList: {flex: 1, overflowY: 'auto', py: 2, bgcolor: '#f7f8fa'},
    inputArea: {p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper'},
    bubbleWrapper: (isMine) => ({
        display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', px: 2, mb: 1.5
    }),
    bubbleContent: (isMine) => ({
        display: 'flex', maxWidth: '75%', gap: 1, flexDirection: isMine ? 'row-reverse' : 'row'
    }),
    messageBox: (isMine) => ({
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
    })
};

const MessageBubble = React.memo(({meId, msg}) => {
    const isMine = useMemo(() => String(msg.sender) === String(meId), [msg.sender, meId]);

    return (<Box sx={STYLES.bubbleWrapper(isMine)}>
            <Box sx={STYLES.bubbleContent(isMine)}>
                {!isMine && (<Avatar
                        src={msg.profileImageUrl}
                        sx={{width: 32, height: 32, bgcolor: '#e0e0e0', fontSize: '0.875rem'}}
                    >
                        {msg.nickname?.[0] || '?'}
                    </Avatar>)}
                <Box>
                    {!isMine && (<Typography variant="caption"
                                             sx={{
                                                 ml: 0.5,
                                                 mb: 0.5,
                                                 display: 'block',
                                                 color: 'text.secondary',
                                                 fontWeight: 600
                                             }}>
                        {msg.nickname || '알 수 없음'}
                        </Typography>)}
                    <Box sx={STYLES.messageBox(isMine)}>
                        <Typography variant="body2" sx={{lineHeight: 1.5}}>{msg.content}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{
                        display: 'block', mt: 0.25, color: 'text.disabled', textAlign: isMine ? 'right' : 'left'
                    }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </Typography>
                </Box>
            </Box>
        </Box>);
});

function ChannelChat({workspaceId, channelId}) {
    const {userData, loading: userLoading} = useAuth();
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const stompClient = useRef(null);
    const scrollRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (!workspaceId || !channelId) return;

        const fetchConversation = async () => {
            setLoading(true);
            try {
                const {data} = await api.get('/chat/conversation', {params: {workspaceId, channelId}});
                setConversationId(data.conversationId);
                const {data: history} = await api.get(`/chat/conversations/${data.conversationId}/messages`);
                setMessages(history);
            } catch (err) {
                console.error("Failed to load chat data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();
    }, [workspaceId, channelId]);

    useEffect(() => {
        if (!conversationId || !userData) return;

        const baseURL = import.meta.env.VITE_API_BASE || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:8080');

        const client = new Client({
            webSocketFactory: () => new SockJS(`${baseURL}/ws`),
            connectHeaders: {Authorization: `Bearer ${getCookie('authToken')}`},
            onConnect: () => {
                client.subscribe(`/topic/chat/rooms/${conversationId}`, (m) => {
                    const receivedMsg = JSON.parse(m.body);
                    console.log(receivedMsg);

                    // 메시지 타입이 CHAT일 때만 목록에 추가
                    if (receivedMsg.type === 'CHAT') {
                        setMessages((prev) => [...prev, receivedMsg]);
                    } else if (receivedMsg.type === 'JOIN') {
                        // 입장 메시지 처리
                    }
                });

                client.publish({
                    destination: `/siack/chat/${conversationId}/join`, body: JSON.stringify({
                        roomId: conversationId, sender: userData.userid, nickname: userData.nickname
                    }),
                });
            },
        });

        stompClient.current = client;
        client.activate();

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
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
            destination: `/siack/chat/${conversationId}/send`, body: JSON.stringify(payload),
        });
        setInput('');
    };

    if (userLoading || loading) {
        return <Box p={4} textAlign="center"><CircularProgress size={24}/></Box>;
    }

    return (<Box sx={STYLES.chatContainer}>
            <Box sx={STYLES.header}>
                <Typography variant="subtitle1" sx={{fontWeight: 700}}># 채널 대화</Typography>
            </Box>

            <Box ref={scrollRef} sx={STYLES.messageList}>
                {messages.length > 0 ? (<>
                        <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
                            <Chip size="small" label="오늘" variant="outlined" sx={{fontSize: '0.75rem', height: 20}}/>
                        </Box>
                        {messages.map((msg, idx) => (
                            <MessageBubble key={msg.id || idx} meId={userData.userid} msg={msg}/>))}
                    </>) : (<Box sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary'
                    }}>
                        메시지가 없습니다.
                    </Box>)}
            </Box>

            <Box sx={STYLES.inputArea}>
                <OutlinedInput
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder={`${userData?.nickname}님으로 메시지 보내기...`}
                    sx={{borderRadius: 1.5, bgcolor: '#fff'}}
                    endAdornment={<InputAdornment position="end">
                        <IconButton color="primary" onClick={handleSend} disabled={!input.trim()}>
                            <SendIcon/>
                        </IconButton>
                    </InputAdornment>}
                />
            </Box>
        </Box>);
}

export default ChannelChat;