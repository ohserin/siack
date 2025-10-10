import React, {useEffect, useState} from 'react';
import {Box} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';
import {useAuth} from '@/contexts/AuthContext.jsx';
import Header from '@/pages/workspace/components/Header.jsx';
import Sidebar from '@/pages/workspace//components/Sidebar.jsx';
import WorkspaceInfo from '@/pages/workspace/screens/Workspace-Info.jsx';
import WorkspaceEdit from '@/pages/workspace/screens/WorkspaceEdit.jsx';

function Workspace() {
    const navigate = useNavigate();
    const {roomId} = useParams();
    const [workspace] = useState(null);
    const [mainContent, setMainContent] = useState('home');
    const [openPanel, setOpenPanel] = useState(false);
    const panelWidth = 220;
    const {loading: authLoading, guard} = useAuth();

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
        }}>
            <Header channelName={workspace?.name || `워크스페이스 #${roomId}`} onExit={() => navigate('/')}/>
            <Box sx={{flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'stretch', position: 'relative'}}>
                <Sidebar mainContent={mainContent} setMainContent={setMainContent} openPanel={openPanel}
                         setOpenPanel={setOpenPanel} panelWidth={panelWidth}/>
                <Box sx={{flex: 1, p: 0, transition: 'margin-left 0.2s', ml: openPanel ? `${panelWidth}px` : 0}}>
                    {mainContent === 'setting' && <WorkspaceInfo setMainContent={setMainContent} />}
                    {mainContent === 'edit' && <WorkspaceEdit onDone={() => setMainContent('setting')} />}
                    {mainContent === 'home' && <Box sx={{p: 4}}>[홈 컨텐츠]</Box>}
                    {mainContent === 'more' && <Box sx={{p: 4}}>[더보기 컨텐츠]</Box>}
                </Box>
            </Box>
        </Box>
    );
}

export default Workspace;
