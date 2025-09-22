import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

function ChatHistory({ messages }) {
  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'background.paper', borderRadius: 2, mb: 1 }}>
      <List dense>
        {messages.length === 0 ? (
          <Typography color="text.secondary">채팅 내역이 없습니다.</Typography>
        ) : (
          messages.map((msg, idx) => (
            <ListItem key={idx} alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemText
                primary={<Typography fontWeight={600}>{msg.user}</Typography>}
                secondary={<>
                  <Typography component="span" sx={{ color: 'text.primary' }}>{msg.text}</Typography>
                  <Typography component="span" sx={{ color: 'text.secondary', ml: 1, fontSize: 12 }}>{msg.time}</Typography>
                </>}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}

export default ChatHistory;

