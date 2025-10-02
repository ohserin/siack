import React from 'react';
import {Box, IconButton, Tooltip, Divider, Drawer} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function Sidebar({setMainContent, openPanel, setOpenPanel, panelWidth}) {
    const sidebarWidth = 56;
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
                {/* 하단 유저 아이콘 */}
                <Box sx={{p: 1, display: 'flex', justifyContent: 'center'}}>
                    <Tooltip title="내 정보" placement="right">
                        <IconButton size="medium">
                            <AccountCircleIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            {/* 확장 Drawer 패널 - position fixed, 사이드바 옆에 겹치게 */}
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
                <Box sx={{p: 2, flex: 1}}>
                    메뉴/설정/정보 등 확장 패널 내용 영역
                </Box>
            </Drawer>
        </>
    );
}

export default Sidebar;
