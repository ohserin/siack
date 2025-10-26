import React from 'react';
import {Box, ListItem, Typography, ButtonBase} from '@mui/material';

export default function ChannelCard({ch, selected, onSelect}) {
    return (
        <ListItem disablePadding sx={{minWidth: 0}}>
            <ButtonBase
                onClick={() => onSelect(ch)}
                sx={{
                    width: '100%',
                    minWidth: 100,
                    borderRadius: 2,
                    p: 1.25,
                    bgcolor: selected ? 'primary.main' : 'background.paper',
                    color: selected ? 'primary.contrastText' : 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                }}
                focusRipple
            >
                <Box sx={{width: '100%'}}>
                    <Typography variant="h6" component="div" sx={{
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {ch.name}
                    </Typography>
                    <Typography variant="body2" sx={{
                        fontSize: '0.6rem',
                        mt: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {ch.description}
                    </Typography>
                </Box>
            </ButtonBase>
        </ListItem>
    );
}
