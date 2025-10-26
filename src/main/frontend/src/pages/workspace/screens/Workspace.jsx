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

    return (
        <Box component="main" sx={{
            height: '100vh',
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
                    pb: isMobile ? 'calc(56px + env(safe-area-inset-bottom, 0px))' : 0
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
