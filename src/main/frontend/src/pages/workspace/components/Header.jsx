import React, {useState} from 'react';
import {Box, IconButton, TextField} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import {useNavigate} from 'react-router-dom';

function WorkspaceHeader({onSearchChange, onHelp}) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        const v = e.target.value;
        setQuery(v);
        onSearchChange && onSearchChange(v);
    };

    return (
        <Box
            component="header"
            sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.1,
                minHeight: 40,
                px: {xs: 1, md: 1.5},
                bgcolor: 'primary.main',
                color: 'common.white',
                borderBottom: '1px solid',
                borderColor: 'primary.dark',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}
        >
            {/* 중앙: 이전/이후 버튼 + 검색창 */}
            <Box sx={{ flex: 1, minWidth: 80, maxWidth: 500, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                {/* 이전/이후 버튼 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => navigate(-1)}
                            sx={{ color: 'common.white', p: 0.5, minWidth: 28, minHeight: 28 }}
                        >
                            <ArrowBackRoundedIcon fontSize="inherit" />
                        </IconButton>
                    </span>
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => navigate(1)}
                            sx={{ color: 'common.white', p: 0.5, minWidth: 28, minHeight: 28 }}
                        >
                            <ArrowForwardRoundedIcon fontSize="inherit" />
                        </IconButton>
                    </span>
                </Box>
                {/* 검색창 */}
                <TextField
                    fullWidth
                    size="small"
                    placeholder="검색..."
                    value={query}
                    onChange={handleSearch}
                    autoComplete="off"
                    name="workspace-search-nohistory"
                    slotProps={{
                        input: {
                            'aria-label': '검색',
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            spellCheck: 'false'
                        }
                    }}
                    sx={{
                        maxWidth: 800,
                        ml: 0.5,
                        '& .MuiInputBase-root': {
                            bgcolor: 'rgba(255,255,255,0.13)',
                            color: 'common.white',
                            backdropFilter: 'blur(2px)',
                            height: 28,
                            fontSize: 13,
                            minHeight: 28,
                            px: 1
                        },
                        '& .MuiInputBase-input': {
                            py: 0.5,
                            fontSize: 13,
                            height: 18
                        },
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                        '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.6)' }
                    }}
                />
            </Box>

            {/* 우측: 도움말 */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                    size="small"
                    onClick={() => onHelp && onHelp()}
                    aria-label="도움말"
                    sx={{ color: 'common.white', p: 0.5, minWidth: 28, minHeight: 28 }}
                >
                    <HelpOutlineRoundedIcon fontSize="inherit" />
                </IconButton>
            </Box>
        </Box>
    );
}

export default WorkspaceHeader;