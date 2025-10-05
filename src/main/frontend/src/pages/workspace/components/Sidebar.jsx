import React from 'react';
import {
    Box,
    IconButton,
    Tooltip,
    Divider,
    Drawer,
    useMediaQuery,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    Avatar,
    Menu,
    MenuItem
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../../contexts/AuthContext.jsx';
import api from '../../../api/api.js';

function Sidebar({setMainContent, openPanel, setOpenPanel, panelWidth}) {
    const sidebarWidth = 56;
    const isMobile = useMediaQuery('(max-width:600px)');
    const [mobileValue, setMobileValue] = React.useState('home');
    const navigate = useNavigate();

    // --- 프로필 이미지 상태 & 메뉴 상태 ---
    const {user, userData, logout} = useAuth();
    const [profileImageUrl, setProfileImageUrl] = React.useState(null);
    const [profileAnchorEl, setProfileAnchorEl] = React.useState(null);

    React.useEffect(() => {
        let cancelled = false;
        const fetchProfileImage = async () => {
            if (userData?.userid) {
                try {
                    const response = await api.get('/v1/user/profileImg', {params: {userid: userData.userid}});
                    if (!cancelled) {
                        setProfileImageUrl(response.data.url || null);
                    }
                } catch {
                    if (!cancelled) setProfileImageUrl(null);
                }
            } else {
                setProfileImageUrl(null);
            }
        };
        void fetchProfileImage();
        return () => {
            cancelled = true;
        };
    }, [userData]);

    const openProfileMenu = (e) => setProfileAnchorEl(e.currentTarget);
    const closeProfileMenu = () => setProfileAnchorEl(null);

    const handleMyInfo = () => {
        closeProfileMenu();
        navigate('/user-setting');
    };
    const handleLogout = () => {
        closeProfileMenu();
        logout();
        navigate('/login');
    };

    // 모바일 하단 네비게이션
    if (isMobile) {
        return (
            <Paper sx={{position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200}} elevation={3}>
                <BottomNavigation
                    showLabels={false}
                    value={mobileValue}
                    onChange={(event, newValue) => {
                        if (newValue === 'logout') {
                            navigate('/');
                            return;
                        }
                        setMobileValue(newValue);
                        setMainContent && setMainContent(newValue);
                    }}
                >
                    <BottomNavigationAction label="홈" value="home" icon={<HomeIcon/>}/>
                    <BottomNavigationAction label="DM" value="dm" icon={<AccountCircleIcon/>}/>
                    <BottomNavigationAction label="정보" value="setting" icon={<Box sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        background: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#888'
                    }}>WS</Box>}/>
                    <BottomNavigationAction label="나가기" value="logout" icon={<LogoutIcon/>}/>
                </BottomNavigation>
            </Paper>
        );
    }

    return (
        <>
            <Box
                sx={{
                    width: sidebarWidth,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fff',
                    borderRight: '1px solid #e0e0e0',
                    boxShadow: '2px 0 4px rgba(0,0,0,0.02)',
                    position: 'relative',
                    zIndex: 2,
                    transition: 'width 0.2s',
                }}
            >
                {/* 상단 워크스페이스 이미지(사각형 placeholder) 및 열기 버튼 */}
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, pb: 0}}>
                    <IconButton
                        onClick={() => setOpenPanel && setOpenPanel(prev => !prev)}
                        size="small"
                        sx={{
                            mb: 0.5,
                            transition: 'transform 0.2s',
                            transform: openPanel ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                        aria-label={openPanel ? '패널 닫기' : '패널 열기'}
                    >
                        <ChevronRightIcon fontSize="small"/>
                    </IconButton>

                    <Box
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 2,
                            background: '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                            color: '#888',
                            mb: 1,
                            cursor: 'pointer',
                        }}
                        onClick={() => setMainContent && setMainContent('setting')}
                        title="워크스페이스 설정"
                    >
                        WS
                    </Box>
                </Box>
                <Divider/>
                {/* 메뉴 아이콘 리스트 */}
                <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1}}>
                    <Tooltip title="홈" placement="right">
                        <IconButton size="medium" sx={{mb: 1}} onClick={() => setMainContent && setMainContent('home')}>
                            <HomeIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="더보기" placement="right">
                        <IconButton size="medium" sx={{mb: 1}} onClick={() => setMainContent && setMainContent('more')}>
                            <MoreHorizIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>
                <Divider/>
                {/* 하단 유저 아바타 */}
                <Box sx={{p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1}}>
                    {user && (
                        <Tooltip title={userData?.nickname || '내 프로필'} placement="right">
                            <IconButton size="medium" onClick={openProfileMenu} sx={{p: 0}}>
                                <Avatar
                                    src={typeof profileImageUrl === 'string' && profileImageUrl.trim() && profileImageUrl !== 'null' && profileImageUrl !== 'undefined' ? profileImageUrl : undefined}
                                    sx={{width: 32, height: 32, bgcolor: 'secondary.main'}}
                                >
                                    {(!profileImageUrl || profileImageUrl === 'null' || profileImageUrl === 'undefined' || profileImageUrl === '') && (
                                        <AccountCircleIcon sx={{fontSize: 24, color: 'white'}}/>
                                    )}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="나가기" placement="right">
                        <IconButton size="medium" onClick={() => navigate('/')}>
                            <LogoutIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            {/* 프로필 메뉴 */}
            <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={closeProfileMenu}
                anchorOrigin={{vertical: 'center', horizontal: 'right'}}
                transformOrigin={{vertical: 'center', horizontal: 'left'}}
            >
                <MenuItem disabled sx={{fontSize: 13, opacity: 0.8}}>{userData?.nickname || '사용자'}</MenuItem>
                <Divider sx={{my: 0.5}}/>
                <MenuItem onClick={handleMyInfo}>내 정보</MenuItem>
                <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
            </Menu>
            {/* 확장 Drawer 패널 */}
            <Drawer
                variant="persistent"
                anchor="left"
                open={openPanel}
                onClose={() => setOpenPanel && setOpenPanel(false)}
                hideBackdrop
                slotProps={{
                    paper: {
                        sx: {
                            width: panelWidth,
                            zIndex: 1,
                            borderRight: '1px solid #e0e0e0',
                            boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
                            position: 'fixed',
                            left: sidebarWidth,
                            top: 0,
                            height: '100vh',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'width 0.2s',
                        }
                    }
                }}
                ModalProps={{keepMounted: true}}
            >
                <Divider/>
                <Box sx={{mt: 5, p: 2, flex: 1}}>
                    채널 및<br/>
                    DM 정보 리스트 영역
                </Box>
            </Drawer>
        </>
    );
}

export default Sidebar;
