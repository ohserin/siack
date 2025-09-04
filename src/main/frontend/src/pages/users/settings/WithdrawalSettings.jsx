import { useState } from 'react';
import { Button, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../api/api';

function WithdrawalSettings() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleWithdraw = async () => {
        setLoading(true);
        setError('');
        setPasswordError('');
        if (!password) {
            setPasswordError('비밀번호를 입력하세요.');
            setLoading(false);
            return;
        }
        try {
            // 실제 API 경로와 방식에 맞게 수정 필요
            await api.delete('/v1/userinfo/delete-user', {
                data: { password }
            });
            logout();
            navigate('/account-deleted');
        } catch (e) {
            if (e.response && e.response.status === 401) {
                setPasswordError('비밀번호가 올바르지 않습니다.');
            } else {
                setError('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{textAlign: 'center', mt: 6}}>
            <Typography variant="h4" gutterBottom>회원 탈퇴</Typography>
            <Typography color="text.secondary" sx={{mb: 3}}>
                회원 탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.<br/>
                정말로 탈퇴하시겠습니까?
            </Typography>
            <Button variant="contained" color="error" onClick={handleOpen} disabled={loading} sx={{mb: 2}}>
                회원 탈퇴
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>정말로 탈퇴하시겠습니까?</DialogTitle>
                <DialogContent>
                    <Typography>탈퇴 후에는 계정 복구가 불가능합니다.</Typography>
                    <TextField
                        label="비밀번호 입력"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        error={!!passwordError}
                        helperText={passwordError}
                        disabled={loading}
                    />
                    {error && <Typography color="error">{error}</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>취소</Button>
                    <Button onClick={handleWithdraw} color="error" disabled={loading || !password}>
                        {loading ? '처리 중...' : '탈퇴하기'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default WithdrawalSettings;
