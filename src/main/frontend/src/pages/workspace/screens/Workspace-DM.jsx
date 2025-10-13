// filepath: g:\siack\src\main\frontend\src\pages\workspace\screens\Workspace-DM.jsx
import React from 'react';
import {
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  Tooltip,
  Typography,
  Chip,
  OutlinedInput
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { makeMockDMData } from '@/pages/workspace/components/dmMock.js';

function MessageBubble({ meId, msg }) {
  const isMine = msg.sender.id === meId;
  return (
    <Box sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', px: 2 }}>
      <Box sx={{ display: 'flex', maxWidth: '70%', gap: 1, flexDirection: isMine ? 'row-reverse' : 'row' }}>
        {!isMine && (
          <Avatar sx={{ width: 28, height: 28, bgcolor: '#e0e0e0' }}>
            {msg.sender.name?.[0] || '?'}
          </Avatar>
        )}
        <Box>
          {!isMine && (
            <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
              {msg.sender.name}
            </Typography>
          )}
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
          <Typography variant="caption" sx={{ display: 'block', mt: 0.25, color: 'text.disabled', textAlign: isMine ? 'right' : 'left' }}>
            {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function WorkspaceDM({ selectedCid: externalSelectedCid }) {
  const { you, conversations, messagesByCid } = React.useMemo(() => makeMockDMData(), []);
  const [selectedCid, setSelectedCid] = React.useState(null);
  const [messageMap, setMessageMap] = React.useState(messagesByCid);
  const [input, setInput] = React.useState('');

  // 외부에서 선택된 CID가 들어오면 내부 선택을 동기화
  React.useEffect(() => {
    if (externalSelectedCid) {
      setSelectedCid(externalSelectedCid);
    }
  }, [externalSelectedCid]);

  const effectiveCid = externalSelectedCid || selectedCid;
  const currentMessages = effectiveCid ? messageMap[effectiveCid] || [] : [];
  const currentUser = conversations.find(c => c.id === effectiveCid)?.user;

  React.useEffect(() => {
    const scroller = document.getElementById('dm-message-scroller');
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [effectiveCid, messageMap]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !effectiveCid) return;
    const newMsg = {
      id: `${effectiveCid}-m${Date.now()}`,
      sender: you,
      text,
      time: Date.now()
    };
    setMessageMap(prev => ({ ...prev, [effectiveCid]: [...(prev[effectiveCid] || []), newMsg] }));
    setInput('');
    setTimeout(() => {
      const scroller = document.getElementById('dm-message-scroller');
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }, 0);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 0 }}>
      {/* 좌측 대화목록 제거: 웹은 확장 Drawer, 모바일은 바텀 드로어에서 제공 */}

      {/* 우측 메시지 영역 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* 대화 헤더 */}
        <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentUser ? (
            <>
              <Avatar sx={{ bgcolor: currentUser.color }}>{currentUser.name?.[0] || '?'}</Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{currentUser.name}</Typography>
                <Typography variant="caption" color="text.secondary">상태: 온라인</Typography>
              </Box>
            </>
          ) : (
            <Typography variant="subtitle1">대화를 선택하세요</Typography>
          )}
        </Box>

        {/* 메시지 스크롤 */}
        <Box id="dm-message-scroller" sx={{ flex: 1, overflow: 'auto', py: 2, bgcolor: '#f7f8fa' }}>
          {currentMessages.length > 0 ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Chip size="small" label="오늘" variant="outlined" />
              </Box>
              {currentMessages.map(msg => (
                <MessageBubble key={msg.id} meId={you.id} msg={msg} />
              ))}
            </>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
              {effectiveCid ? '메시지가 없습니다. 첫 메시지를 보내보세요.' : '좌측 패널 또는 하단 DM 목록에서 대화를 선택하세요.'}
            </Box>
          )}
        </Box>

        {/* 입력창 */}
        <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <OutlinedInput
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            fullWidth
            multiline
            size="small"
            minRows={1}
            maxRows={3}
            placeholder={currentUser ? `${currentUser.name}에게 메시지 보내기...` : '대화를 선택하세요'}
            sx={{
              borderRadius: 1,
              '& .MuiInputBase-input': {
                py: 0.75,
                fontSize: 14,
                lineHeight: 1.4
              }
            }}
            endAdornment={
              <InputAdornment position="end">
                <Tooltip title="보내기 (Enter)">
                  <span>
                    <IconButton size="small" color="primary" onClick={handleSend} disabled={!input.trim() || !effectiveCid}>
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </InputAdornment>
            }
          />
        </Box>
      </Box>
    </Box>
  );
}
