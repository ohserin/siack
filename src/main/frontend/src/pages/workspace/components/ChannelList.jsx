import React, { useState, useEffect } from 'react';
import { Box, List, ListItemButton, ListItemText, Typography, IconButton, Stack, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

function ChannelList({ channels, selectedChannelId, onSelect, onAdd, onSettings }) {
  const mainChannel = channels.find(c => c.id === selectedChannelId) || channels[0];
  const otherChannels = channels.filter(c => c.id !== mainChannel.id);
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width:900px)').matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width:900px)');
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener ? mql.addEventListener('change', handler) : mql.addListener(handler);
    setIsDesktop(mql.matches);
    return () => {
      mql.removeEventListener ? mql.removeEventListener('change', handler) : mql.removeListener(handler);
    };
  }, []);

  return (
    <Box sx={{
      width: { xs: '100%', md: 260 },
      bgcolor: 'secondary.main',
      borderRadius: 2,
      p: { xs: '10px 0', md: '10px 0' },
      boxShadow: 1,
      height: { xs: 'auto', md: '100%' },
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      alignSelf: { xs: 'unset', md: 'flex-start' },
      color: '#fff',
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1, px: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>채널</Typography>
        <Box>
          <IconButton size="small" onClick={onAdd} sx={{ color: '#fff' }}><AddIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={onSettings} sx={{ color: '#fff' }}><SettingsIcon fontSize="small" /></IconButton>
        </Box>
      </Stack>
      {/* PC: 전체 채널 리스트, 모바일: 선택된 채널 + 드롭다운 */}
      {isDesktop ? (
        <List dense disablePadding sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
          {channels.map((ch) => (
            <ListItemButton
              key={ch.id}
              selected={selectedChannelId === ch.id}
              onClick={() => onSelect(ch.id)}
              sx={{ borderRadius: 1, color: '#fff', mb: 0.5, bgcolor: selectedChannelId === ch.id ? 'rgba(255,255,255,0.08)' : 'inherit' }}
            >
              <ListItemText
                primary={<Typography sx={{ color: '#fff' }}>{ch.name}</Typography>}
                secondary={<Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{ch.description}</Typography>}
              />
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Stack direction="row" alignItems="center" spacing={1} >
          <Box sx={{ flex: 1 }}>
            <List dense disablePadding>
              <ListItemButton
                selected
                sx={{ borderRadius: 1, color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' }}
              >
                <ListItemText
                  primary={<Typography sx={{ color: '#fff' }}>{mainChannel.name}</Typography>}
                  secondary={<Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{mainChannel.description}</Typography>}
                />
              </ListItemButton>
            </List>
          </Box>
          {otherChannels.length > 0 && (
            <IconButton size="small" onClick={() => setOpen(o => !o)} sx={{ color: '#fff', ml: 0.5 }}>
              {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </IconButton>
          )}
        </Stack>
      )}
      {/* 모바일: 나머지 채널 드롭다운 */}
      {!isDesktop && open && otherChannels.length > 0 && (
        <Box sx={{ position: 'relative', mb: 1 }}>
          <List dense disablePadding sx={{ position: 'absolute', left: 0, right: 0, zIndex: 10, bgcolor: 'secondary.main', borderRadius: 1, boxShadow: 3 }}>
            {otherChannels.map((ch) => (
              <ListItemButton
                key={ch.id}
                selected={selectedChannelId === ch.id}
                onClick={() => { onSelect(ch.id); setOpen(false); }}
                sx={{ borderRadius: 1, color: '#fff' }}
              >
                <ListItemText
                  primary={<Typography sx={{ color: '#fff' }}>{ch.name}</Typography>}
                  secondary={<Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{ch.description}</Typography>}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}

export default ChannelList;
