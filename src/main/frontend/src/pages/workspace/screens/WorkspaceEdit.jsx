import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Avatar, Stack, Alert, CircularProgress
} from '@mui/material';
import api from '../../../api/api.js';

function WorkspaceEdit({ onDone }) {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [forbidden, setForbidden] = useState(false);
    const [fields, setFields] = useState({
        workspaceName: '',
        workspaceDesc: '',
        iconUrl: '',
    });
    const [origin, setOrigin] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = React.useRef();

    useEffect(() => {
        setLoading(true);
        setError('');
        api.get(`/v1/workspace/${roomId}/info`)
            .then(res => {
                const body = res.data || {};
                if (body.userRole !== 'OWNER') {
                    setForbidden(true);
                    return;
                }
                setFields({
                    workspaceName: body.workspaceName || '',
                    workspaceDesc: body.workspaceDesc || '',
                    iconUrl: body.iconUrl || '',
                });
                setOrigin(body);
            })
            .catch(() => setError('워크스페이스 정보를 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, [roomId]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFields(f => ({ ...f, [name]: value }));
    };

    const handleSave = async e => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.put(`/v1/workspace/${roomId}/info`, {
                workspaceName: fields.workspaceName,
                workspaceDesc: fields.workspaceDesc,
                iconUrl: fields.iconUrl,
            });
            if (onDone) onDone();
        } catch (err) {
            setError('저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            // 실제 업로드 API 경로에 맞게 수정 필요
            const res = await api.post('/v1/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const url = res.data?.url;
            if (url) {
                setFields(f => ({ ...f, iconUrl: url }));
            } else {
                setUploadError('업로드 실패: URL 반환 안됨');
            }
        } catch (err) {
            setUploadError('이미지 업로드에 실패했습니다.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) return <Box p={4} textAlign="center"><CircularProgress /></Box>;
    if (forbidden) return <Box p={4}><Alert severity="error">오너만 접근할 수 있습니다.</Alert></Box>;
    if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;

    return (
        <Box maxWidth={480} mx="auto" mt={5} p={3}>
            <Typography variant="h5" fontWeight={700} mb={2}>워크스페이스 정보 수정</Typography>
            <form onSubmit={handleSave}>
                <Stack spacing={2}>
                    <TextField
                        label="워크스페이스 이름"
                        name="workspaceName"
                        value={fields.workspaceName}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="설명"
                        name="workspaceDesc"
                        value={fields.workspaceDesc}
                        onChange={handleChange}
                        multiline
                        minRows={2}
                    />
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                        <Avatar
                            src={fields.iconUrl}
                            variant="rounded"
                            sx={{ width: 64, height: 64, borderRadius: 2 }}
                        >
                            {fields.workspaceName?.[0] || 'W'}
                        </Avatar>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <Button
                            variant="outlined"
                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            disabled={uploading}
                        >
                            {uploading ? '업로드 중...' : '이미지 업로드'}
                        </Button>
                    </Stack>
                    {uploadError && <Alert severity="error">{uploadError}</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button variant="outlined" onClick={onDone} disabled={saving}>취소</Button>
                        <Button type="submit" variant="contained" disabled={saving}>저장</Button>
                    </Stack>
                </Stack>
            </form>
        </Box>
    );
}

export default WorkspaceEdit;
