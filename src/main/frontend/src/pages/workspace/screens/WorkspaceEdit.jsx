import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Avatar, Stack, Alert, CircularProgress
} from '@mui/material';
import api from '@/api/api.js';

function WorkspaceEdit({ onDone }) {
    const { roomId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [forbidden, setForbidden] = useState(false);
    const [fields, setFields] = useState({
        workspaceName: '',
        workspaceDesc: '',
        iconUrl: '',
    });
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
                    iconUrl: body.workspaceImage || '',
                });
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
            await api.patch(`/v1/workspace/modify`, {
                workspaceId: Number(roomId),
                workspaceName: fields.workspaceName,
                workspaceDesc: fields.workspaceDesc,
            });
            if (onDone) onDone();
        } catch {
            setError('저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    // 이미지 리사이즈 함수 (비율 유지, 300x300, 남는 공간 투명)
    async function resizeImage(file, maxSize = 300) {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            const reader = new FileReader();
            reader.onload = e => {
                img.onload = () => {
                    // 캔버스는 항상 300x300, 투명 배경
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = maxSize;
                    canvas.height = maxSize;
                    ctx.clearRect(0, 0, maxSize, maxSize);
                    // 비율 유지하여 축소/확대
                    const scale = Math.min(maxSize / img.width, maxSize / img.height);
                    const newW = Math.round(img.width * scale);
                    const newH = Math.round(img.height * scale);
                    // 중앙 배치
                    const dx = Math.round((maxSize - newW) / 2);
                    const dy = Math.round((maxSize - newH) / 2);
                    ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, newW, newH);
                    // 항상 PNG로 저장 (투명도 보존)
                    canvas.toBlob(blob => {
                        if (blob) resolve(blob);
                        else reject(new Error('이미지 변환 실패'));
                    }, 'image/png', 0.95);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError('');
        try {
            const resized = await resizeImage(file, 300);
            const filename = file.name.replace(/\.[^.]+$/, '.png');
            const formData = new FormData();
            formData.append('file', resized, filename);
            const res = await api.post(`/v1/workspace/${roomId}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const url = res?.data?.url;
            if (typeof url === 'string' && url.trim() !== '' && url !== 'null' && url !== 'undefined') {
                setFields(f => ({ ...f, iconUrl: url })); // 업로드 즉시 미리보기 갱신
            }
        } catch {
            setUploadError('이미지 업로드에 실패했습니다.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) return <Box p={4} textAlign="center"><CircularProgress /></Box>;
    if (forbidden) return <Box p={4}><Alert severity="error">워크스페이스 소유자만 접근할 수 있습니다.</Alert></Box>;
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
