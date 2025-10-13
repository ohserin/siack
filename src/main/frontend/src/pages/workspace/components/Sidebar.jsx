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
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {useNavigate, useParams} from 'react-router-dom';
import api from '@/api/api.js';
import {useAuth} from '@/contexts/AuthContext.jsx';
import DMList from '@/pages/workspace/components/DMList.jsx';
import { makeMockDMData } from '@/pages/workspace/components/dmMock.js';

function Sidebar({ setMainContent, panelWidth, selectedDM, onSelectDM, openPanel, setOpenPanel }) {
    const sidebarWidth = 56;
    const isMobile = useMediaQuery('(max-width:600px)');
    const [mobileValue, setMobileValue] = React.useState('home');
    const [mobileDMOpen, setMobileDMOpen] = React.useState(false);
    const navigate = useNavigate();
    const { roomId } = useParams(); // 경로 파라미터(Workspace ID)

    // --- 프로필 / 인증 정보 ---
    const {user, userData, logout} = useAuth();
    const [profileAnchorEl, setProfileAnchorEl] = React.useState(null);
    const openProfileMenu = (e) => setProfileAnchorEl(e.currentTarget);
    const closeProfileMenu = () => setProfileAnchorEl(null);
    const handleMyInfo = () => { closeProfileMenu(); navigate('/user-setting'); };
    const handleLogout = () => { closeProfileMenu(); logout(); navigate('/login'); };
    const avatarUrl = (typeof userData?.profileImageUrl === 'string'
        && userData.profileImageUrl.trim() !== ''
        && userData.profileImageUrl !== 'null'
        && userData.profileImageUrl !== 'undefined') ? userData.profileImageUrl : undefined;

    // 워크스페이스 이미지/이름 상태
    const [wsImage, setWsImage] = React.useState(null);
    const [wsName, setWsName] = React.useState('WS');

    // DM 리스트 임시 데이터
    const { conversations } = React.useMemo(() => makeMockDMData(), []);

    React.useEffect(() => {
        let mounted = true;
        if (!roomId) return;
        api.get(`/v1/workspace/${roomId}/info`)
            .then(res => {
                if (!mounted) return;
                const body = res.data;
                if (body && body.statusCode === 200) {
                    const url = body.workspaceImage;
                    if (url && typeof url === 'string' && url.trim() !== '' && url !== 'null' && url !== 'undefined') {
                        setWsImage(url);
                    } else {
                        setWsImage(null);
                    }
                    if (body.workspaceName) setWsName(body.workspaceName);
                }
            })
            .catch(() => {/* fail silent */});
        return () => { mounted = false; };
    }, [roomId]);

    const validWsImage = wsImage && wsImage.trim() !== '' && wsImage !== 'null' && wsImage !== 'undefined' ? wsImage : null;

    // 모바일 하단 네비게이션 + DM 리스트 바텀 드로어
    if (isMobile) {
        return (
            <>
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
                            if (newValue === 'dm') {
                                setMobileDMOpen(true);
                            } else {
                                setMobileDMOpen(false);
                            }
                        }}
                    >
                        <BottomNavigationAction label="홈" value="home" icon={<HomeIcon/>}/>
                        <BottomNavigationAction label="DM" value="dm" icon={<AccountCircleIcon/>}/>
                        <BottomNavigationAction label="정보" value="setting" icon={validWsImage ? (
                            <Avatar
                                src={validWsImage}
                                variant="rounded"
                                sx={{width: 24, height: 24, borderRadius: 1}}
                            >{wsName?.[0] || 'W'}</Avatar>
                        ) : (
                            <Box sx={{
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
                            }}>WS</Box>
                        )}/>
                        <BottomNavigationAction label="나가기" value="logout" icon={<LogoutIcon/>}/>
                    </BottomNavigation>
                </Paper>
                <Drawer
                    anchor="bottom"
                    open={mobileDMOpen}
                    onClose={() => setMobileDMOpen(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                height: '65vh',
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8
                            }
                        }
                    }}
                >
                    <Box sx={{ p: 1, textAlign: 'center', color: 'text.secondary', fontSize: 12 }}>DM 목록</Box>
                    <Divider />
                    <Box sx={{height: '100%', overflow: 'auto'}}>
                        <DMList
                            conversations={conversations}
                            selectedCid={selectedDM}
                            onSelect={(cid) => {
                                onSelectDM && onSelectDM(cid);
                                setMobileDMOpen(false);
                            }}
                        />
                    </Box>
                </Drawer>
            </>
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
                {/* 상단 워크스페이스 이미지(사각형 placeholder) + 패널 토글 버튼 */}
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
                    {/* 워크스페이스 아이콘 */}
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
                            overflow: 'hidden'
                        }}
                        onClick={() => setMainContent && setMainContent('setting')}
                        title="워크스페이스 설정"
                    >
                        {validWsImage ? (
                            <Avatar
                                src={validWsImage}
                                variant="rounded"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 2,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    bgcolor: '#f0f0f0'
                                }}
                                slotProps={{ img: { style: { objectFit: 'cover' } } }}
                                onError={(e) => { e.currentTarget.src = ''; }}
                            >{wsName?.[0] || 'W'}</Avatar>
                        ) : (
                            'WS'
                        )}
                    </Box>
                </Box>
                <Divider/>
                {/* 메뉴 아이콘 리스트 (DM 버튼 제거) */}
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
                                    src={avatarUrl}
                                    sx={{width: 32, height: 32, bgcolor: 'secondary.main'}}
                                >
                                    {!avatarUrl && (
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
            {/* 확장 Drawer 패널: 열려 있을 때 항상 DM 리스트 표시 */}
            <Drawer
                variant="persistent"
                anchor="left"
                open={Boolean(openPanel)}
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
                <Box sx={{mt: 5, p: 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
                    <DMList
                        conversations={conversations}
                        selectedCid={selectedDM}
                        onSelect={(cid) => onSelectDM && onSelectDM(cid)}
                    />
                </Box>
            </Drawer>
        </>
    );
}

export default Sidebar;
