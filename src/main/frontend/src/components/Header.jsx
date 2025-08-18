import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    useMediaQuery,
    Avatar,
    Menu,
    MenuItem,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { navigate } from '../utils/navigation.js';
import Sidebar from './Sidebar.jsx';

function Header() {
    const { user, logout, userData } = useAuth();

    // 반응형 디자인을 위한 미디어 쿼리
    const isDesktop = useMediaQuery('(min-width:1080px)');
    const showHamburger = useMediaQuery('(max-width:1079px)');

    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    // 사이드바를 열고 닫는 핸들러
    const handleDrawerOpen = () => setDrawerOpen(true);
    const handleDrawerClose = () => setDrawerOpen(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLogoutClick = () => {
        handleMenuClose();
        handleLogout();
    };

    const handleMyInfoClick = () => {
        handleMenuClose();
        navigate('/modify-profile');
    };

    return (
        <>
            <AppBar position="static" color="primary">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* 모바일 화면에서 보여지는 햄버거 아이콘 */}
                        {showHamburger && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerOpen}
                                sx={{ mr: 2 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}

                        <Typography
                            variant="h6"
                            component={RouterLink}
                            to="/"
                            sx={{ color: 'inherit', textDecoration: 'none' }}
                        >
                            Siack
                        </Typography>

                        {/* 데스크톱 메뉴 항목 */}
                        {isDesktop && (
                            <Box sx={{ ml: 4, display: 'flex', gap: 2 }}>
                                <Button color="inherit" component={RouterLink} to="/service">서비스</Button>
                                <Button color="inherit" component={RouterLink} to="/pricing">요금제</Button>
                                <Button color="inherit" component={RouterLink} to="/contact">문의</Button>
                            </Box>
                        )}
                    </Box>

                    {/* 로그인/프로필 섹션 */}
                    <Box>
                        {user ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0, color: 'white' }}>
                                    {userData?.profileImage ? (
                                        <Avatar src={userData.profileImage} alt="profile" />
                                    ) : (
                                        <AccountCircleIcon fontSize="large" sx={{ color: 'white' }} />
                                    )}
                                    <Typography variant="body1" sx={{ ml: 1, color: 'white' }}>
                                        {userData?.nickname || ''}
                                    </Typography>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                    <MenuItem onClick={handleMyInfoClick}>내 정보</MenuItem>
                                    <MenuItem onClick={handleLogoutClick}>로그아웃</MenuItem>
                                </Menu>
                            </Box>
                        ) : (
                            <>
                                <Button color="inherit" component={RouterLink} to="/login">
                                    로그인
                                </Button>
                                <Button color="inherit" component={RouterLink} to="/join">
                                    회원가입
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* 사이드바 컴포넌트 */}
            <Sidebar open={drawerOpen} onClose={handleDrawerClose} />
        </>
    );
}

export default Header;
