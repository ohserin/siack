import {useState} from 'react';
import {Box, Typography, TextField, Button, Divider} from '@mui/material';
import {useAuth} from '../../../contexts/AuthContext.jsx';
import {useModal} from '../../../contexts/ModalContext.jsx';
import api from '../../../api/api.js';
import {regexTest} from '../../../utils/validation.js';

function PasswordSettings() {
    const {user} = useAuth();
    const {showModal} = useModal();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showModal('알림', '모든 필드를 입력해주세요.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showModal('알림', '새 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!regexTest('password', newPassword)) {
            showModal('알림', '비밀번호는 8~20자, 영문/숫자/특수문자를 모두 포함해야 합니다.');
            return;
        }

        try {
            const verifyResponse = await api.post('/v1/userinfo/verify-password', {currentPassword}, {
                headers: {Authorization: `Bearer ${user.token}`},
            });

            if (verifyResponse.data.statusCode !== 200) {
                showModal('오류', verifyResponse.data.message || '현재 비밀번호가 일치하지 않습니다.');
                return;
            }

            // 2. 새 비밀번호로 변경
            const changeResponse = await api.post('/v1/userinfo/change-password', {newPassword}, {
                headers: {Authorization: `Bearer ${user.token}`},
            });

            if (changeResponse.data.statusCode === 200) {
                showModal('성공', '비밀번호가 성공적으로 변경되었습니다.');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                showModal('오류', changeResponse.data.message || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            showModal('서버 오류', error?.response?.data?.message || '서버 오류가 발생했습니다.');
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={400} p={2}>비밀번호 변경</Typography>
            <Divider sx={{mb: 2}}/>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, px: 2}}>
                <TextField
                    label="현재 비밀번호"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="새 비밀번호"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="새 비밀번호 확인"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                />
                <Button
                    variant="contained"
                    onClick={handlePasswordChange}
                    sx={{mt: 2}}
                >
                    비밀번호 변경
                </Button>
            </Box>
        </Box>
    );
}

export default PasswordSettings;
