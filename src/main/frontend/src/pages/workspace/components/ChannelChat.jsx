import React, {useEffect, useRef, useState, useLayoutEffect} from 'react';
import {Box, IconButton, OutlinedInput, Typography, Avatar, Chip} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function MessageBubble({meId, msg}) {
    const isMine = msg.sender?.id === meId;
    const timeText = msg.ts ? new Date(msg.ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '';
    return (
        <Box sx={{display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', px: 2, mb: 1}}>
            <Box sx={{display: 'flex', maxWidth: '70%', gap: 1, flexDirection: isMine ? 'row-reverse' : 'row'}}>
                {!isMine && (
                    <Avatar sx={{width: 28, height: 28, bgcolor: '#e0e0e0'}}>
                        {msg.sender?.name?.[0] || '?'}
                    </Avatar>
                )}
                <Box>
                    {!isMine && (
                        <Typography variant="caption" sx={{ml: 0.5, color: 'text.secondary'}}>
                            {msg.sender?.name}
                        </Typography>
                    )}
                    {/* 말풍선과 시간(옆)에 대한 행 레이아웃 */}
                    <Box sx={{display: 'flex', alignItems: 'flex-end', gap: 0.5}}>
                        <Box
                            sx={{
                                mt: 0.25,
                                px: 1.25,
                                py: 0.75,
                                borderRadius: 2,
                                bgcolor: isMine ? 'primary.main' : 'background.paper',
                                color: isMine ? 'primary.contrastText' : 'text.primary',
                                boxShadow: isMine ? 'none' : '0 1px 2px rgba(0,0,0,0.08)',
                                border: isMine ? 'none' : '1px solid',
                                borderColor: 'divider',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}
                        >
                            <Typography variant="body2">{msg.text}</Typography>
                        </Box>

                        {/* 말풍선 옆에 시간 표시 (나/타인에 따라 위치가 바뀜) */}
                        <Typography variant="caption" sx={{color: 'text.disabled', mb: 0.5, whiteSpace: 'nowrap'}}>
                            {timeText}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default function ChannelChat({channel}) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const listRef = useRef(null);
    const lastMessageRef = useRef(null);
    const inputRef = useRef(null);
    const you = {id: 'me', name: 'You'};

    useEffect(() => {
        if (!channel) return;
        // 샘플 메시지 세팅
        setMessages([
            {
                id: `sys-${Date.now()}`,
                sender: {id: 'system', name: 'System'},
                text: `채널 ${channel.name}에 입장했습니다.`,
                ts: Date.now()
            },
            {id: `u1-${Date.now() + 1}`, sender: {id: 'user1', name: 'Alice'}, text: '안녕하세요!', ts: Date.now() + 1000},
        ]);
    }, [channel]);

    // 공통 스크롤 정렬 함수
    const scrollToBottom = () => {
        const scroller = listRef.current;
        if (!scroller) return;

        try {
            const rootPadding = getComputedStyle(document.documentElement).getPropertyValue('--bottom-padding');
            if (rootPadding) {
                const p = rootPadding.trim();
                scroller.style.paddingBottom = p;
                scroller.style.scrollPaddingBottom = p;
            }
        } catch {
            // ignore
        }

        // visualViewport 기반 가림 영역 계산
        const bottomInset = (window.visualViewport && window.visualViewport.height)
            ? Math.max(0, window.innerHeight - window.visualViewport.height - (window.visualViewport.offsetTop || 0))
            : 0;

        if (lastMessageRef.current && typeof lastMessageRef.current.scrollIntoView === 'function') {
            try {
                lastMessageRef.current.scrollIntoView({behavior: 'auto', block: 'end'});
            } catch {
                // ignore
            }
        }

        // 수동 보정 (visualViewport가 존재하면 키보드 높이를 반영)
        const desired = scroller.scrollHeight - scroller.clientHeight - bottomInset;
        scroller.scrollTop = Math.max(0, desired);
    };

    // 메시지 변경 시 자동 스크롤
    useLayoutEffect(() => {
        scrollToBottom();
    }, [messages]);

    // visualViewport/포커스 이벤트에 반응해 스크롤 보정
    useEffect(() => {
        const onViewportChange = () => {
            setTimeout(scrollToBottom, 50);
        };

        window.addEventListener('resize', onViewportChange);
        window.addEventListener('focus', onViewportChange);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', onViewportChange);
            window.visualViewport.addEventListener('scroll', onViewportChange);
        }

        return () => {
            window.removeEventListener('resize', onViewportChange);
            window.removeEventListener('focus', onViewportChange);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', onViewportChange);
                window.visualViewport.removeEventListener('scroll', onViewportChange);
            }
        };
    }, []);

    const send = () => {
        if (!text || !text.trim()) return;
        const newMsg = {id: `m-${Date.now()}`, sender: you, text: text.trim(), ts: Date.now()};
        setMessages((s) => [...s, newMsg]);
        setText('');
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    if (!channel) return null;

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <Typography variant="subtitle1" sx={{px: 2, py: 1}}>{channel.name}</Typography>
            <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <Box id="channel-message-scroller" ref={listRef}
                     sx={{flex: 1, overflow: 'auto', py: 2, bgcolor: '#f7f8fa'}}>
                    {messages.length > 0 ? (
                        <>
                            <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
                                <Chip size="small" label="오늘" variant="outlined"/>
                            </Box>
                            {messages.map((msg, idx) => (
                                <Box key={msg.id} ref={idx === messages.length - 1 ? lastMessageRef : null}>
                                    <MessageBubble meId={you.id} msg={msg}/>
                                </Box>
                            ))}
                        </>
                    ) : (
                        <Box sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary'
                        }}>
                            메시지가 없습니다. 첫 메시지를 보내보세요.
                        </Box>
                    )}
                </Box>

                <Box sx={{
                    p: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <OutlinedInput
                        inputRef={inputRef}
                        value={text}
                        onFocus={() => setTimeout(scrollToBottom, 50)}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKey}
                        fullWidth
                        multiline
                        size="small"
                        minRows={1}
                        maxRows={4}
                        placeholder="메시지 입력..."
                        sx={{borderRadius: 2}}
                        endAdornment={
                            <IconButton size="small" color="primary" onClick={send} disabled={!text.trim()}>
                                <SendIcon fontSize="small"/>
                            </IconButton>
                        }
                    />
                </Box>
            </Box>
        </Box>
    );
}
