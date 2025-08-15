import {
    Container, Typography, TextField, Divider, Box, Link, useTheme, Avatar, IconButton, Modal
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import api from "../../api/api.js";
import {useModal} from "../../contexts/ModalContext.jsx";

function ModifyProfile() {
    const { userData, getRoleLabel, user, guard } = useAuth();
    const theme = useTheme();
    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
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

    const handleEditClick = () => {
        fileInputRef.current?.click();
    };

    const handleSave = async (updatedFields = {}) => {
        setSaving(true);
        setMessage('');
        try {
            const response = await api.post('/v1/userinfo/modify', {
                email: updatedFields.email?.trim() || email.trim() || null,
                nickname: updatedFields.nickname?.trim() || nickname.trim() || null,
                phone: updatedFields.phone?.trim() || phone.trim() || null,
            }, { headers: { Authorization: `Bearer ${user.token}` } });

            if (response.data.statusCode === 200) {
                setMessage("정보가 성공적으로 업데이트되었습니다.");
            } else {
                setNickname(userData.nickname || '');
                setEmail(userData.email || '');
                setPhone(userData.phone || '');
                showModal({ title: '업데이트 실패', content: response.data.message || "업데이트에 실패했습니다." });
            }
        } catch (error) {
            setNickname(userData.nickname || '');
            setEmail(userData.email || '');
            setPhone(userData.phone || '');
            showModal({ title: '서버 오류', content: '서버 오류가 발생했습니다.' });
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setErrorMessage('');
    };

    return (
        <Container component="main" maxWidth={false} sx={{
            mt: 8, mb: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{
                    backgroundColor: theme.palette.grey[100],
                    width: '100%',
                    border: `1px solid ${theme.palette.grey[400]}`,
                    borderRadius: 2,
                    mb: 2,
                    minWidth: 500,
                    overflow: 'hidden'
                }}>
                    <Typography variant="h5" component="h5" fontWeight={400} align="left" p={2}>
                        프로필
                    </Typography>
                    <Divider sx={{ my: 2, margin: 0 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, backgroundColor: theme.palette.grey[200] }}>
                        <ProfileImageEditor
                            profileImage={profileImage}
                            onEditClick={handleEditClick}
                            fileInputRef={fileInputRef}
                            onImageChange={handleImageChange}
                        />

                        <Box>
                            <Typography variant="h6" component="h6" fontWeight={300} align="left">
                                {userData ? userData.username : ''}
                            </Typography>
                            <Typography component="span" fontWeight={200} align="left">
                                {userData ? getRoleLabel() : ''}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{
                    backgroundColor: theme.palette.grey[100],
                    width: '100%',
                    border: `1px solid ${theme.palette.grey[400]}`,
                    borderRadius: 2,
                    mb: 2,
                    minWidth: 500
                }}>
                    <Typography variant="h6" component="h6" fontWeight={400} align="left" p={2}>
                        정보 수정
                    </Typography>
                    <Divider sx={{ my: 2, margin: 0 }} />

                    <EditableField
                        label="이메일"
                        value={email}
                        onChange={setEmail}
                        onConfirm={(newValue) => {
                            setEmail(newValue);
                            handleSave({ email: newValue });
                        }}
                    />
                    <EditableField
                        label="닉네임"
                        value={nickname}
                        onChange={setNickname}
                        onConfirm={(newValue) => {
                            setNickname(newValue);
                            handleSave({ nickname: newValue });
                        }}
                    />
                    <EditableField
                        label="휴대전화번호"
                        value={phone}
                        onChange={setPhone}
                        onConfirm={(newValue) => {
                            setPhone(newValue);
                            handleSave({ phone: newValue });
                        }}
                    />
                </Box>

                <Box display="flex" width="100%" justifyContent="end">
                    <Box>
                        <Link href="/" variant="body2">
                            돌아가기
                        </Link>
                    </Box>
                </Box>

                {message && <Typography color="success.main">{message}</Typography>}
            </Box>
        </Container>
    );
}

function ProfileImageEditor({ profileImage, onEditClick, fileInputRef, onImageChange }) {
    const theme = useTheme();

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'left',
            alignItems: 'center',
            padding: 1,
            borderRadius: 1,
            position: 'relative',
        }}>
            <Box sx={{ position: 'relative', width: 80, height: 80 }}>
                {profileImage ? (
                    <Avatar src={profileImage} alt="Profile" sx={{ width: 80, height: 80 }} />
                ) : (
                    <AccountCircleIcon sx={{ fontSize: 80, color: 'primary.main' }} />
                )}
                <IconButton
                    size="small"
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: `1px solid ${theme.palette.grey[400]}`,
                        width: 26,
                        height: 26,
                        '&:hover': { backgroundColor: theme.palette.grey[200] },
                    }}
                    onClick={onEditClick}
                >
                    <EditIcon sx={{ fontSize: 16, color: 'grey.800' }} />
                </IconButton>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={onImageChange}
                />
            </Box>
        </Box>
    );
}

function EditableField({ label, value, onChange, onConfirm }) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleEditClick = () => setIsEditing(true);
    const handleConfirmClick = () => {
        setIsEditing(false);
        onChange(inputValue);
        if (onConfirm) onConfirm(inputValue); // 최신 값 직접 전달
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 2, pr: 2 }}>
            <Typography sx={{ minWidth: 100 }}>{label}</Typography>
            <Box sx={{
                position: 'relative',
                flex: 1,
                '&:hover .edit-icon': { opacity: 1 },
            }}>
                <TextField
                    fullWidth
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    margin="normal"
                    disabled={!isEditing}
                />
                <IconButton
                    className="edit-icon"
                    onClick={isEditing ? handleConfirmClick : handleEditClick}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: '55%',
                        right: 15,
                        transform: 'translateY(-50%)',
                        padding: 0,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                    }}
                >
                    {isEditing ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                </IconButton>
            </Box>
        </Box>
    );
}

export default ModifyProfile;
