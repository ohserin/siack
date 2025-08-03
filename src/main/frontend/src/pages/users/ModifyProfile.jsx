import {
    Container, Typography, TextField, Divider, Box, Link, useTheme, Avatar, IconButton,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import {useRef, useState} from "react";

function ModifyProfile() {
    const theme = useTheme();
    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [nickname, setNickname] = useState('홍길동');
    const [email, setEmail] = useState('example@example.com');
    const [phone, setPhone] = useState('010-1234-5678');


    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    const handleEditClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Container component="main" maxWidth={false} sx={{ mt: 8, mb: 4, display: 'flex',
            flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 1000 }}>
                <Box sx={{
                    backgroundColor: theme.palette.grey[100],
                    width: '100%',
                    border: `1px solid ${theme.palette.grey[400]}`,
                    borderRadius: 2,
                    mb: 2,
                    minWidth: 500
                }}>
                    <Typography variant="h5" component="h5" fontWeight={400} align="left" p={2}>
                        프로필
                    </Typography>
                    <Divider sx={{ my: 2, margin: 0 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, backgroundColor: theme.palette.grey[200],}}>
                        <ProfileImageEditor
                            profileImage={profileImage}
                            onEditClick={handleEditClick}
                            fileInputRef={fileInputRef}
                            onImageChange={handleImageChange}
                        />

                        <Box>
                            <Typography variant="h6" component="h6" fontWeight={300} align="left">
                                유저아이디
                            </Typography>
                            <Typography component="span" fontWeight={200} align="left">
                                일반 유저
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

                    <EditableField label="닉네임" value={nickname} onChange={setNickname} />
                    <EditableField label="이메일" value={email} onChange={setEmail} />
                    <EditableField label="휴대전화번호" value={phone} onChange={setPhone} />
                </Box>

                <Box display="flex" width="100%" justifyContent="end">
                    <Box>
                        <Link href="/" variant="body2">
                            돌아가기
                        </Link>
                    </Box>
                </Box>

            </Box>


        </Container>
    );
}

function ProfileImageEditor({ profileImage, onEditClick, fileInputRef, onImageChange }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'left',
                alignItems: 'center',
                padding: 1,
                borderRadius: 1,
                position: 'relative',
            }}
        >
            <Box sx={{ position: 'relative', width: 80, height: 80 }}>
                {profileImage ? (
                    <Avatar
                        src={profileImage}
                        alt="Profile"
                        sx={{ width: 80, height: 80 }}
                    />
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

function EditableField({ label, value, onChange }) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    const handleEditClick = () => setIsEditing(true);
    const handleConfirmClick = () => {
        onChange(inputValue);
        setIsEditing(false);
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 2, pr: 2 }}>
            <Typography sx={{ minWidth: 100 }}>{label}</Typography>

            {/* 텍스트 필드 + 아이콘을 하나의 relative 박스로 감쌈 */}
            <Box sx={{ position: 'relative', flex: 1 }}>
                <TextField
                    fullWidth
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    margin="normal"
                    disabled={!isEditing}
                />
                <IconButton
                    onClick={isEditing ? handleConfirmClick : handleEditClick}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: '55%',
                        right: 15,
                        transform: 'translateY(-50%)',
                        padding: 0,
                    }}
                >
                    {isEditing ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                </IconButton>
            </Box>
        </Box>
    );
}

export default ModifyProfile;
