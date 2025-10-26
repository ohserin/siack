import React, {useEffect, useState} from 'react';
import {Box, useMediaQuery} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';
import {useAuth} from '@/contexts/AuthContext.jsx';
import Header from '@/pages/workspace/components/Header.jsx';
import Sidebar from '@/pages/workspace//components/Sidebar.jsx';
import WorkspaceInfo from '@/pages/workspace/screens/Workspace-Info.jsx';
import WorkspaceEdit from '@/pages/workspace/screens/WorkspaceEdit.jsx';
import WorkspaceDM from '@/pages/workspace/screens/Workspace-DM.jsx';
import WorkspaceHome from '@/pages/workspace/screens/WorkspaceHome.jsx';

function Workspace() {
    const navigate = useNavigate();
    const {roomId} = useParams();
    const [workspace] = useState(null);
    const [mainContent, setMainContent] = useState('home');
    const [openPanel, setOpenPanel] = useState(false);
    const panelWidth = 220;
    const isMobile = useMediaQuery('(max-width:600px)');
    const {loading: authLoading, guard} = useAuth();
    const [selectedDM, setSelectedDM] = useState(null);

    useEffect(() => {
        if (!authLoading) {
            guard(true, '/');
        }
    }, [authLoading, guard]);


    useEffect(() => {
        const KEYBOARD_THRESHOLD = 120;
        const setAppHeight = () => {
            // visualViewport가 있으면 키보드/주소창 변화까지 반영된 실제 뷰포트 높이를 사용
            const vh = (window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight;
            document.documentElement.style.setProperty('--app-height', `${vh}px`);

            // 키보드/가림 영역 추정: 레이아웃 뷰포트(innerHeight)와 시각적 뷰포트의 차이
            const bottomInset = Math.max(0, window.innerHeight - vh - (window.visualViewport && window.visualViewport.offsetTop ? window.visualViewport.offsetTop : 0));
            document.documentElement.style.setProperty('--keyboard-height', `${bottomInset}px`);

            // 키보드가 열렸다고 판단되면 기본 하단 바(56px)를 숨기고 safe-area만 남김
            if (bottomInset > KEYBOARD_THRESHOLD) {
                document.documentElement.style.setProperty('--bottom-padding', `env(safe-area-inset-bottom, 0px)`);
            } else {
                // 기본 상태: 하단 고정바 높이 + safe-area
                document.documentElement.style.setProperty('--bottom-padding', `calc(56px + env(safe-area-inset-bottom, 0px))`);
            }
        };

        setAppHeight();

        // 리사이즈/visualViewport 이벤트에 반응
        window.addEventListener('resize', setAppHeight);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', setAppHeight);
            window.visualViewport.addEventListener('scroll', setAppHeight);
        }

        return () => {
            window.removeEventListener('resize', setAppHeight);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', setAppHeight);
                window.visualViewport.removeEventListener('scroll', setAppHeight);
            }
        };
    }, []);

    return (
        <Box component="main" sx={{
            height: 'var(--app-height, 100vh)',
            display: 'flex',
            flexDirection: 'column',
            background: '#f8f9fa',
            pt: 0,
            overflowX: 'hidden',
        }}>
            <Header channelName={workspace?.name || `워크스페이스 #${roomId}`} onExit={() => navigate('/')}/>
            <Box sx={{flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'stretch', position: 'relative'}}>
                <Sidebar
                    mainContent={mainContent}
                    setMainContent={setMainContent}
                    openPanel={openPanel}
                    setOpenPanel={setOpenPanel}
                    panelWidth={panelWidth}
                    selectedDM={selectedDM}
                    onSelectDM={(cid) => { setSelectedDM(cid); setMainContent('dm'); }}
                />
                <Box sx={{
                    flex: 1,
                    p: 0,
                    transition: 'margin-left 0.2s',
                    ml: isMobile ? 0 : (openPanel ? `${panelWidth}px` : 0),
                    minWidth: 0,
                    pb: isMobile ? 'var(--bottom-padding, calc(56px + env(safe-area-inset-bottom, 0px)))' : 0
                }}>
                    {mainContent === 'setting' && <WorkspaceInfo setMainContent={setMainContent} />}
                    {mainContent === 'edit' && <WorkspaceEdit onDone={() => setMainContent('setting')} />}
                    {mainContent === 'home' && <WorkspaceHome />}
                    {mainContent === 'more' && <Box sx={{p: 4}}>[더보기 컨텐츠]</Box>}
                    {mainContent === 'dm' && <WorkspaceDM selectedCid={selectedDM} />}
                </Box>
            </Box>
        </Box>
    );
}

export default Workspace;
