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

function Header() {
    const { user, logout, userData } = useAuth();

    // 서비스/요금제/문의 반응형
    const isDesktop = useMediaQuery('(min-width:1080px)');
    const showHamburger = useMediaQuery('(max-width:1079px)');

    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

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
        <AppBar position="static" color="primary">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Box display="flex" alignItems="center">
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{ color: 'inherit', textDecoration: 'none' }}
                    >
                        Siack
                    </Typography>

                    {/* 반응형 메뉴 */}
                    {isDesktop && (
                        <Box sx={{ ml: 4, display: 'flex', gap: 2 }}>
                            <Button color="inherit">서비스</Button>
                            <Button color="inherit">요금제</Button>
                            <Button color="inherit">문의</Button>
                        </Box>
                    )}
                    {showHamburger && (
                        <IconButton color="inherit" sx={{ ml: 2 }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                </Box>

                {/* 로그인 / 회원가입 또는 프로필 */}
                <Box>
                    {user ? (
                        <Box display="flex" alignItems="center" gap={1}>
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
    );
}

export default Header;
