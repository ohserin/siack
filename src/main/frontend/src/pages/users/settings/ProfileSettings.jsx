import {
    Typography, TextField, Divider, Box, useTheme, Avatar, IconButton, CircularProgress, Tooltip,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import {useEffect, useRef, useState} from "react";
import {useAuth} from "../../../contexts/AuthContext.jsx";
import api from "../../../api/api.js";
import {useModal} from "../../../contexts/ModalContext.jsx";
import {checkDuplicate, regexTest} from "../../../utils/validation.js";

function ProfileSettings() {
    const {userData, getRoleLabel, user, fetchUserDataFromAPI} = useAuth();
    const theme = useTheme();
    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const {showModal} = useModal();

    useEffect(() => {
        if (userData) {
            setNickname(userData.nickname || '');
            setEmail(userData.email || '');
            setPhone(userData.phone || '');
        }
    }, [userData]);

    useEffect(() => {
        if (userData?.userid) {
            api.get('/v1/user/profileImg', {params: {userid: userData.userid}})
                .then(res => {
                    setProfileImage(res.data.url || null);
                })
                .catch(() => {
                    setProfileImage(null);
                });
        } else {
            setProfileImage(null);
        }
    }, [userData?.userid, userData?.profileimg]);


    // 이미지 리사이즈 함수 (비율 유지, 500x500, 남는 공간 투명, 작은 이미지는 확대하지 않음)
    async function resizeImage(file, maxSize = 500) {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            const reader = new FileReader();
            reader.onload = e => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = maxSize;
                    canvas.height = maxSize;
                    ctx.clearRect(0, 0, maxSize, maxSize);
                    const scale = Math.min(1, maxSize / img.width, maxSize / img.height);
                    const newW = Math.round(img.width * scale);
                    const newH = Math.round(img.height * scale);
                    const dx = Math.round((maxSize - newW) / 2);
                    const dy = Math.round((maxSize - newH) / 2);
                    ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, newW, newH);
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

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const resized = await resizeImage(file, 500);
                const filename = file.name.replace(/\.[^.]+$/, '.png');
                const formData = new FormData();
                formData.append('file', resized, filename);
                const response = await api.post('/v1/userinfo/modify-profile', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                if (response.data.statusCode === 200) {
                    await fetchUserDataFromAPI(user.token);
                    showModal('성공', '프로필 이미지가 변경되었습니다.');
                } else {
                    showModal('오류', response.data.message || '이미지 업로드에 실패했습니다.');
                }
            } catch (error) {
                showModal('서버 오류', error?.response?.data?.message || '서버 오류가 발생했습니다.');
            }
        }
    };

    const handleEditClick = () => fileInputRef.current?.click();

    const handleSave = async (updatedFields = {}) => {
        const original = {
            email: userData.email || '',
            nickname: userData.nickname || '',
            phone: userData.phone || ''
        };

        const fieldToUpdate = Object.keys(updatedFields)[0];
        if (!fieldToUpdate) return true;

        const newValue = updatedFields[fieldToUpdate].trim();

        if (newValue === original[fieldToUpdate]) {
            showModal('알림', '변경된 내용이 없습니다.');
            return true;
        }

        const payload = {
            email: email,
            nickname: nickname,
            phone: phone,
            [fieldToUpdate]: newValue
        };

        if (fieldToUpdate === 'email' && !regexTest('email', newValue)) {
            showModal('알림', '올바른 이메일 형식이 아닙니다.');
            return false;
        }
        if (fieldToUpdate === 'nickname' && !regexTest('nickname', newValue)) {
            showModal('알림', '닉네임은 2~30자, 영문/숫자/한글/_(언더바)만 가능합니다.');
            return false;
        }
        if (fieldToUpdate === 'phone' && newValue && !regexTest('phone', newValue)) {
            showModal('알림', '올바른 전화번호 형식이 아닙니다.');
            return false;
        }

        try {
            if (newValue) {
                const status = await checkDuplicate(fieldToUpdate, newValue);
                if (status !== 200) {
                    const fieldName = {email: '이메일', nickname: '닉네임', phone: '휴대전화번호'}[fieldToUpdate];
                    showModal('알림', `이미 사용 중인 ${fieldName}입니다.`);
                    return false;
                }
            }

            const response = await api.post('/v1/userinfo/modify', payload, {
                headers: {Authorization: `Bearer ${user.token}`}
            });

            if (response.data.statusCode === 200) {
                await fetchUserDataFromAPI(user.token);
                showModal('정보가 변경되었습니다.', '프로필이 정상적으로 업데이트되었습니다.');
                return true;
            } else {
                showModal('업데이트 실패', response.data.message || '업데이트에 실패했습니다.');
                return false;
            }
        } catch (error) {
            showModal('서버 오류', error?.response?.data?.message || '서버 오류가 발생했습니다.');
            return false;
        }
    };

    return (
        <Box>
            <Box sx={{
                backgroundColor: theme.palette.grey[100],
                width: '100%',
                border: `1px solid ${theme.palette.grey[400]}`,
                borderRadius: 2,
                mb: 2,
                overflow: 'hidden'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    backgroundColor: 'transparent',
                }}>
                    <Typography variant="h5" fontWeight={400}>프로필</Typography>
                    {userData && (
                        <Typography variant="body2" sx={{
                            fontSize: 13,
                            color: 'white',
                            bgcolor: '#4eb100',
                            borderRadius: 1,
                            px: 1,
                            py: 0.2,
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                            ml: 1,
                        }}>
                            {getRoleLabel()}
                        </Typography>
                    )}
                </Box>
                <Divider sx={{my: 2, margin: 0}}/>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: { xs: 2, sm: 2 },
                    backgroundColor: theme.palette.grey[200],
                    p: 2,
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    flexWrap: { xs: 'nowrap', sm: 'nowrap' },
                    overflowX: { xs: 'auto', sm: 'visible' },
                }}>
                    <ProfileImageEditor profileImage={profileImage} onEditClick={handleEditClick}
                                        fileInputRef={fileInputRef} onImageChange={handleImageChange}/>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: 22, mb: 0.5 }}>
                            {userData?.nickname || '-'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, maxWidth: { xs: 140, sm: 220 } }}>
                            <Tooltip title={userData?.userid || ''} arrow>
                                <Typography variant="body2" color="text.secondary" sx={{
                                    fontSize: 15,
                                    mr: 1,
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    maxWidth: { xs: 100, sm: 180 },
                                    minWidth: 0,
                                    display: 'block',
                                    cursor: 'pointer',
                                }}>
                                    {userData?.userid ? `@${userData.username}` : ''}
                                </Typography>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box sx={{
                backgroundColor: theme.palette.grey[100],
                width: '100%',
                border: `1px solid ${theme.palette.grey[400]}`,
                borderRadius: 2,
                mb: 2
            }}>
                <Typography variant="h6" fontWeight={400} p={2}>정보 수정</Typography>
                <Divider sx={{my: 2, margin: 0}}/>
                <EditableField label="닉네임" value={nickname} onConfirm={(v) => handleSave({nickname: v})}/>
                <EditableField label="이메일" value={email} onConfirm={(v) => handleSave({email: v})}/>
                <EditableField label="휴대전화번호" value={phone} onConfirm={(v) => handleSave({phone: v})}/>
            </Box>
        </Box>
    );
}

function ProfileImageEditor({profileImage, onEditClick, fileInputRef, onImageChange}) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!profileImage) {
            setLoading(false);
            setError(false);
            return;
        }

        setLoading(true);
        setError(false);
        const img = new Image();
        img.src = profileImage;
        img.onload = () => setLoading(false);
        img.onerror = () => {
            setLoading(false);
            setError(true);
        };
    }, [profileImage]);

    return (
        <Box sx={{display: 'flex', alignItems: 'center', padding: 1, borderRadius: 1, position: 'relative'}}>
            <Box sx={{
                position: 'relative',
                width: 90,
                height: 90,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: loading ? theme.palette.primary.main : 'transparent',
                borderRadius: '50%',
                transition: 'background-color 0.3s',
                border: `1px solid ${loading ? theme.palette.primary.dark : theme.palette.grey[400]}`,
                boxSizing: 'border-box',
            }}>
                {loading ? (
                    <CircularProgress size={52} sx={{color: 'white'}}/>
                ) : (error || !profileImage) ? (
                    <AccountCircleIcon sx={{fontSize: 88, color: 'secondary.main'}}/>
                ) : (
                    <Avatar src={profileImage} sx={{width: 88, height: 88}}/>
                )}

                <IconButton size="large" sx={{
                    position: 'absolute',
                    bottom: 1,
                    right: 1,
                    backgroundColor: 'white',
                    border: `1.5px solid ${theme.palette.grey[400]}`,
                    width: 30,
                    height: 30,
                    boxShadow: 1,
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {backgroundColor: theme.palette.grey[200]},
                    zIndex: 2
                }} onClick={onEditClick}>
                    <EditIcon sx={{fontSize: 22, color: 'grey.800'}}/>
                </IconButton>
                <input type="file" accept="image/*" ref={fileInputRef} style={{display: 'none'}}
                       onChange={onImageChange}/>
            </Box>
        </Box>
    );
}

function EditableField({label, value, onConfirm}) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => setInputValue(value), [value]);

    const handleConfirmClick = async () => {
        if (inputValue.trim() === value) {
            setIsEditing(false);
            return;
        }
        const success = await onConfirm(inputValue);
        setIsEditing(false);
        if (!success) {
            setInputValue(value);
        }
    };

    return (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, pl: 2, pr: 2}}>
            <Box sx={{minWidth: 120, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography>{label}</Typography>
                <Typography>:</Typography>
            </Box>
            <Box sx={{position: 'relative', flex: 1, '&:hover .edit-icon': {opacity: 1}}}>
                <TextField fullWidth value={inputValue} onChange={(e) => setInputValue(e.target.value)} margin="normal"
                           disabled={!isEditing}/>
                <IconButton className="edit-icon" onClick={isEditing ? handleConfirmClick : () => setIsEditing(true)}
                            size="small" sx={{
                    position: 'absolute',
                    top: '55%',
                    right: 15,
                    transform: 'translateY(-50%)',
                    padding: 0,
                    opacity: isEditing ? 1 : 0,
                    transition: 'opacity 0.2s'
                }}>
                    {isEditing ? <CheckIcon fontSize="small"/> : <EditIcon fontSize="small"/>}
                </IconButton>
            </Box>
        </Box>
    );
}

export default ProfileSettings;
