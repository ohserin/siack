import React, {useEffect, useState} from 'react';
import {Box, Typography, Button, Divider} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';
import theme from '../../theme';
import api from '../../api/api';
import {useAuth} from '../../contexts/AuthContext.jsx';

function Workspace() {
    const navigate = useNavigate();
    const {roomId} = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [workspace, setWorkspace] = useState(null);
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
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#f8f9fa',
            pt: 4,
        }}>
            <Box sx={{width: '100%', maxWidth: 960, px: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                    <Typography variant="h5" fontWeight={800} sx={{color: theme.palette.secondary.main}}>
                        워크스페이스
                    </Typography>
                    <Button variant="outlined" color="inherit" onClick={() => navigate(-1)}>뒤로</Button>
                </Box>
                <Divider sx={{mb: 3}}/>

                {loading ? (
                    <Typography sx={{color: '#888'}}>불러오는 중...</Typography>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <Box sx={{bgcolor: '#fff', borderRadius: 3, p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.07)'}}>
                        <Typography variant="h6" fontWeight={700} sx={{mb: 1}} className="line-clamp-1">
                            {workspace?.name || `워크스페이스 #${roomId}`}
                        </Typography>
                        {workspace?.description && (
                            <Typography sx={{color: '#666', mb: 2}} className="line-clamp-3">{workspace.description}</Typography>
                        )}
                        <Typography sx={{color: '#999'}}>ID: {roomId}</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Workspace;
