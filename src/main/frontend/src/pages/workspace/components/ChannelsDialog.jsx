import React from 'react';
import {Dialog, DialogTitle, DialogContent, List, ListItemButton, ListItemText} from '@mui/material';

export default function ChannelsDialog({open, onClose, channels, onSelect, selectedChannel}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>모든 채널</DialogTitle>
            <DialogContent>
                <List>
                    {channels.map((ch) => (
                        <ListItemButton key={ch.channelId} onClick={() => {
                            onSelect(ch);
                            onClose();
                        }} selected={selectedChannel?.channelId === ch.channelId}>
                            <ListItemText primary={ch.name} secondary={ch.description}/>
                        </ListItemButton>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
}

