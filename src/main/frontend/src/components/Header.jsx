import React from 'react';
import {AppBar, Toolbar, Typography, Box, Button, IconButton, useMediaQuery, useTheme,} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

function Header() {
    const theme = useTheme();

    const isDesktop = useMediaQuery('(min-width:1080px)');
    const showBothButtons = useMediaQuery('(min-width:1215px)');
    const showOnlyLogin = useMediaQuery('(min-width:1080px) and (max-width:1214px)');
    const showHamburger = useMediaQuery('(max-width:1079px)');

    return (
        <AppBar position="static" color="primary">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* 왼쪽: 로고 + 메뉴 리스트 (1080 이상만 메뉴 보임) */}
                <Box display="flex" alignItems="center">
                    <Typography variant="h6" component="div">
                        Siack
                    </Typography>
                    {isDesktop && (
                        <Box sx={{ ml: 4, display: 'flex', gap: 2 }}>
                            <Button color="inherit">서비스</Button>
                            <Button color="inherit">요금제</Button>
                            <Button color="inherit">문의</Button>
                        </Box>
                    )}
                </Box>

                {/* 오른쪽: 버튼 또는 햄버거 아이콘 */}
                <Box>
                    {showBothButtons && (
                        <>
                            <Button color="inherit" component={RouterLink} to="/login">로그인</Button>
                            <Button color="inherit" component={RouterLink} to="/join">회원가입</Button>
                        </>
                    )}
                    {showOnlyLogin && <Button color="inherit" component={RouterLink} to="/login">로그인</Button>}
                    {showHamburger && (
                        <IconButton color="inherit">
                            <MenuIcon />
                        </IconButton>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
