import React, {useEffect, useState} from 'react';
import {Box} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';
import api from '../../api/api';
import {useAuth} from '../../contexts/AuthContext.jsx';
import WorkspaceHeader from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import WorkspaceInfo from './WorkspaceInfo.jsx';

function Workspace() {
    const navigate = useNavigate();
    const {roomId} = useParams();
    const [, setLoading] = useState(true);
    const [, setError] = useState('');
    const [workspace, setWorkspace] = useState(null);
    const [mainContent, setMainContent] = useState('home');
    const [openPanel, setOpenPanel] = useState(false);
    const panelWidth = 220;
    const {loading: authLoading, guard} = useAuth();

    useEffect(() => {
        if (!authLoading) {
            guard(true, '/');
        }
    }, [authLoading, guard]);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        api
            .get(`/v1/workspace/${roomId}`)
            .then((res) => {
                if (!mounted) return;
                setWorkspace(res.data || null);
                setLoading(false);
            })
            .catch(() => {
                if (!mounted) return;
                setError('워크스페이스 정보를 불러오지 못했습니다.');
                setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [roomId]);

    return (
        <Box component="main" sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#f8f9fa',
            pt: 0,
        }}>
            <WorkspaceHeader channelName={workspace?.name || `워크스페이스 #${roomId}`} onExit={() => navigate('/')}/>
            <Box sx={{flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'stretch', position: 'relative'}}>
                <Sidebar mainContent={mainContent} setMainContent={setMainContent} openPanel={openPanel}
                         setOpenPanel={setOpenPanel} panelWidth={panelWidth}/>
                <Box sx={{flex: 1, p: 0, transition: 'margin-left 0.2s', ml: openPanel ? `${panelWidth}px` : 0}}>
                    {mainContent === 'setting' && <WorkspaceInfo/>}
                    {mainContent === 'home' && <Box sx={{p: 4}}>[홈 컨텐츠]</Box>}
                    {mainContent === 'more' && <Box sx={{p: 4}}>[더보기 컨텐츠]</Box>}
                </Box>
            </Box>
        </Box>
    );
}

export default Workspace;
