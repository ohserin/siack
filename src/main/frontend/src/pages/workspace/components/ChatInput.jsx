import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function ChatInput({ onSend }) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper component="form" sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderRadius: 2 }} onSubmit={e => { e.preventDefault(); handleSend(); }}>
      <TextField
        fullWidth
        multiline
        minRows={1}
        maxRows={4}
        placeholder="메시지를 입력하세요..."
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        variant="standard"
        InputProps={{ disableUnderline: true }}
        sx={{ flex: 1, mr: 1 }}
      />
      <IconButton color="primary" onClick={handleSend} disabled={!value.trim()}>
        <SendIcon />
      </IconButton>
    </Paper>
  );
}

export default ChatInput;

