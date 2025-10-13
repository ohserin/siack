import React from 'react';
import { Avatar, Badge, Box, Chip, Divider, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';

export default function DMList({ conversations = [], selectedCid, onSelect }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>다이렉트 메시지</Typography>
      </Box>
      <Divider />
      <List sx={{ p: 0, overflow: 'auto' }}>
        {conversations.map((c) => (
          <ListItem key={c.id} disablePadding>
            <ListItemButton selected={selectedCid === c.id} onClick={() => onSelect && onSelect(c.id)} alignItems="flex-start">
              <ListItemAvatar>
                <Badge color="error" badgeContent={c.unread} invisible={!c.unread} overlap="circular">
                  <Avatar sx={{ bgcolor: c.user.color }}>{c.user.name?.[0] || '?'}</Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: 1.1 }}>{c.user.name}</Typography>
                    {c.unread ? <Chip size="small" label={c.unread} color="error" /> : null}
                  </Box>
                }
                secondary={<Typography variant="caption" color="text.secondary" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{c.snippet}</Typography>}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
