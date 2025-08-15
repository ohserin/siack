import {
    Container, Typography, TextField, Divider, Box, Link, useTheme, Avatar, IconButton,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import api from "../../api/api.js";
import {useModal} from "../../contexts/ModalContext.jsx";
import {checkDuplicate, regexTest} from "../../utils/validation.js";

function ModifyProfile() {
    const { userData, setUserData, getRoleLabel, user, guard } = useAuth();
    const theme = useTheme();
    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const {showModal} = useModal();

    useEffect(() => {
        guard(true, '/');
        if (userData) {
            setNickname(userData.nickname || '');
            setEmail(userData.email || '');
            setPhone(userData.phone || '');
            setProfileImage(userData.profileimg || null);
        }
    }, [userData]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
            // 프로필 이미지 변경 API는 별도 구현 필요
        }
    };

    const handleEditClick = () => fileInputRef.current?.click();

    const handleSave = async (updatedFields = {}) => {
        const original = { email, nickname, phone };
        const newValues = {
            email: updatedFields.email?.trim() || email.trim(),
            nickname: updatedFields.nickname?.trim() || nickname.trim(),
            phone: updatedFields.phone?.trim() || phone.trim(),
        };

        if (Object.keys(newValues).every(key => newValues[key] === original[key])) {
            showModal('알림', '변경된 내용이 없습니다.');
            return;
        }

        // 형식 체크
        if (!regexTest('email', newValues.email)) return showModal('알림', '올바른 이메일 형식이 아닙니다.');
        if (!regexTest('nickname', newValues.nickname)) return showModal('알림', '닉네임은 2~30자, 영문/숫자/한글/_(언더바)만 가능합니다.');
        if (!regexTest('phone', newValues.phone)) return showModal('알림', '올바른 전화번호 형식이 아닙니다.');

        try {
            // 중복 검사
            for (const key of ['email', 'nickname', 'phone']) {
                if (updatedFields[key] && newValues[key] !== original[key]) {
                    const status = await checkDuplicate(key, newValues[key]);
                    if (status !== 200) return showModal('알림', `이미 사용 중인 ${key}입니다.`);
                }
            }

            const response = await api.post('/v1/userinfo/modify', newValues, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (response.data.statusCode === 200) {
                setUserData(prev => ({ ...prev, ...newValues }));
                showModal('정보가 변경되었습니다.', '프로필이 정상적으로 업데이트되었습니다.');
            } else {
                showModal('업데이트 실패', response.data.message || '업데이트에 실패했습니다.');
            }
        } catch (error) {
            showModal('서버 오류', error?.response?.data?.message || '서버 오류가 발생했습니다.');
        }
    };


    return (
        <Container component="main" maxWidth={false} sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: '500', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ backgroundColor: theme.palette.grey[100], width: '100%', border: `1px solid ${theme.palette.grey[400]}`, borderRadius: 2, mb: 2, minWidth: 500, overflow: 'hidden' }}>
                    <Typography variant="h5" fontWeight={400} p={2}>프로필</Typography>
                    <Divider sx={{ my: 2, margin: 0 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, backgroundColor: theme.palette.grey[200] }}>
                        <ProfileImageEditor profileImage={profileImage} onEditClick={handleEditClick} fileInputRef={fileInputRef} onImageChange={handleImageChange} />
                        <Box>
                            <Typography variant="h6" fontWeight={300}>{userData?.username}</Typography>
                            <Typography fontWeight={200}>{userData ? getRoleLabel() : ''}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ backgroundColor: theme.palette.grey[100], width: '100%', border: `1px solid ${theme.palette.grey[400]}`, borderRadius: 2, mb: 2, minWidth: 500 }}>
                    <Typography variant="h6" fontWeight={400} p={2}>정보 수정</Typography>
                    <Divider sx={{ my: 2, margin: 0 }} />
                    <EditableField label="이메일" value={email} onChange={setEmail} onConfirm={(v) => void handleSave({ email: v })} />
                    <EditableField label="닉네임" value={nickname} onChange={setNickname} onConfirm={(v) => void handleSave({ nickname: v })} />
                    <EditableField label="휴대전화번호" value={phone} onChange={setPhone} onConfirm={(v) => void handleSave({ phone: v })} />
                </Box>

                <Box display="flex" width="100%" justifyContent="end">
                    <Link href="/" variant="body2">돌아가기</Link>
                </Box>
            </Box>
        </Container>
    );
}

function ProfileImageEditor({ profileImage, onEditClick, fileInputRef, onImageChange }) {
    const theme = useTheme();
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', padding: 1, borderRadius: 1, position: 'relative' }}>
            <Box sx={{ position: 'relative', width: 80, height: 80 }}>
                {profileImage ? <Avatar src={profileImage} sx={{ width: 80, height: 80 }} /> : <AccountCircleIcon sx={{ fontSize: 80, color: 'primary.main' }} />}
                <IconButton size="small" sx={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', border: `1px solid ${theme.palette.grey[400]}`, width: 26, height: 26, '&:hover': { backgroundColor: theme.palette.grey[200] } }} onClick={onEditClick}>
                    <EditIcon sx={{ fontSize: 16, color: 'grey.800' }} />
                </IconButton>
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={onImageChange} />
            </Box>
        </Box>
    );
}

function EditableField({ label, value, onChange, onConfirm }) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => setInputValue(value), [value]);

    const handleConfirmClick = () => {
        setIsEditing(false);
        onChange(inputValue);
        if (onConfirm) onConfirm(inputValue);
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 2, pr: 2 }}>
            <Typography sx={{ minWidth: 100 }}>{label}</Typography>
            <Box sx={{ position: 'relative', flex: 1, '&:hover .edit-icon': { opacity: 1 } }}>
                <TextField fullWidth value={inputValue} onChange={(e) => setInputValue(e.target.value)} margin="normal" disabled={!isEditing} />
                <IconButton className="edit-icon" onClick={isEditing ? handleConfirmClick : () => setIsEditing(true)} size="small" sx={{ position: 'absolute', top: '55%', right: 15, transform: 'translateY(-50%)', padding: 0, opacity: 0, transition: 'opacity 0.2s' }}>
                    {isEditing ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                </IconButton>
            </Box>
        </Box>
    );
}

export default ModifyProfile;
