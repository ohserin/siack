import {useForm} from 'react-hook-form';
import {TextField, Button, Box, Typography, Link, InputAdornment, Divider, Paper, Container, Fade} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FaceIcon from '@mui/icons-material/Face';
import React, {useEffect, useState} from "react";
import api from "../../api/api.js";
import theme from '../../theme.js'
import {useAuth} from "../../contexts/AuthContext.jsx";
import {navigate} from "../../utils/navigation.js";
import {checkDuplicate, regexTest} from "../../utils/validation.js";

const errorMessage = {
    usernameEmpty: "아이디: 필수 정보입니다.",
    passwordEmpty: "비밀번호: 필수 정보입니다.",
    passwordConfirmEmpty: "비밀번호확인: 필수 정보입니다.",
    emailEmpty: "이메일: 필수 정보입니다.",
    nicknameEmpty: "닉네임: 필수 정보입니다.",
    usernameRegex: "아이디: 아이디는 4~50자이며, 영문/숫자/특수문자(_, @)를 포함하고, 특정 특수문자는 연속으로 사용할 수 없습니다.",
    passwordRegex: "비밀번호: 비밀번호는 최소 8자 이상이며, 최소 하나의 소문자와 숫자를 포함해야 합니다.",
    passwordConfirmDisagree: "비밀번호확인: 비밀번호가 일치하지 않습니다.",
    emailRegex: "이메일: 이메일이 정확한지 확인해 주세요.",
    nicknameRegex: "닉네임: 닉네임이 정확한지 확인해 주세요.",
    phoneRegex: "휴대전화번호: 휴대전화번호가 정확한지 확인해 주세요.",
    usernameDuplicate: "아이디: 이미 사용중인 아이디입니다.",
    emailDuplicate: "이메일: 이미 사용중인 이메일입니다.",
    phoneDuplicate: "휴대전화번호: 이미 사용중인 휴대전화번호입니다.",
    nicknameDuplicate: "닉네임: 이미 사용중인 닉네임입니다. ",
}

async function checkUsernameDuplicate(username, setError) {
    if (!regexTest('username', username)) {
        setError('username', {type: 'pattern', message: errorMessage.usernameRegex});
        return false;
    }

    const status = await checkDuplicate('username', username);

    const errorMap = {
        409: {type: 'duplicate', message: errorMessage.usernameDuplicate},
        400: {type: 'pattern', message: errorMessage.usernameRegex},
    };

    if (status === 200) return true;

    if (errorMap[status]) setError('username', errorMap[status]);
    else alert('서버 오류가 발생했습니다.');

    return false;
}

async function checkEmailDuplicate(email, setError) {
    if (!regexTest('email', email)) {
        setError('email', {type: 'pattern', message: errorMessage.emailRegex});
        return false;
    }

    const status = await checkDuplicate('email', email);

    const errorMap = {
        409: {type: 'duplicate', message: errorMessage.emailDuplicate},
        400: {type: 'pattern', message: errorMessage.emailRegex},
    };

    if (status === 200) return true;

    if (errorMap[status]) setError('email', errorMap[status]);
    else alert('서버 오류가 발생했습니다.');

    return false;
}

async function checkNicknameDuplicate(nickname, setError) {
    if (!regexTest('nickname', nickname)) {
        setError('nickname', {type: 'nickname', message: errorMessage.nicknameRegex});
        return false;
    }

    const status = await checkDuplicate('nickname', nickname);

    const errorMap = {
        409: {type: 'duplicate', message: errorMessage.nicknameDuplicate},
        400: {type: 'pattern', message: errorMessage.nicknameRegex},
    };

    if (status === 200) return true;

    if (errorMap[status]) setError('nickname', errorMap[status]);
    else alert('서버 오류가 발생했습니다.');

    return false;
}

async function checkPhoneDuplicate(phone, setError) {
    if (!phone) return true;

    if (!regexTest('phone', phone)) {
        setError('phone', {type: 'pattern', message: errorMessage.phoneRegex});
        return false;
    }

    const status = await checkDuplicate('phone', phone);

    const errorMap = {
        409: {type: 'duplicate', message: errorMessage.phoneDuplicate},
        400: {type: 'pattern', message: errorMessage.phoneRegex},
    };

    if (status === 200) return true;

    if (errorMap[status]) setError('phone', errorMap[status]);
    else alert('서버 오류가 발생했습니다.');

    return false;
}

async function registerUser(formData) {
    try {
        const response = await api.post('/v1/user/register', {
            username: formData.username,
            password: formData.password,
            email: formData.email,
            nickname: formData.nickname,
            phone: formData.phone,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {message: '서버 오류'};
    }
}

function Join() {
    const [showForm, setShowForm] = useState(false);
    const { guard } = useAuth();

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: {errors},
    } = useForm();

    useEffect(() => {
        setShowForm(true);
        guard(false, '/');
    }, []);

    // 비밀번호 필드의 현재 값을 watch 하여 비밀번호 확인 필드 유효성 검사에 사용
    const password = watch('password', '');

    const onSubmit = async (data) => {

        const usernameOk = await checkUsernameDuplicate(data.username, setError);
        if (!usernameOk) return;

        const emailOk = await checkEmailDuplicate(data.email, setError);
        if (!emailOk) return;

        const nicknameOk = await checkNicknameDuplicate(data.nickname, setError);
        if (!nicknameOk) return;

        const phoneOk = await checkPhoneDuplicate(data.phone, setError);
        if (!phoneOk) return;

        try {
            await registerUser(data);
            alert('회원가입 성공!');
            navigate('/login');
        } catch (err) {
            alert(`회원가입 실패: ${err.message}`);
        }
    };

    return (
        <Container component="main" maxWidth={false} sx={{mt: 8, mb: 4, width: '100%', maxWidth: 500}}>
            <Fade in={showForm} timeout={1000}>
                <Paper elevation={3} sx={{p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <AccountCircleIcon sx={{fontSize: 60, color: 'primary.main', mb: 2}}/>
                    <Typography variant="h4" component="h2" align="center" gutterBottom>
                        회원가입
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField
                            id="username"
                            name="username"
                            label="아이디"
                            placeholder="아이디"
                            fullWidth
                            margin="normal"
                            error={!!errors.username}
                            helperText={errors.username?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon/>
                                        </InputAdornment>
                                    ),
                                    ...register('username', {
                                        required: errorMessage.usernameEmpty,
                                        validate: value => regexTest('username', value) || errorMessage.usernameRegex
                                    }),
                                },
                            }}
                        />
                        <TextField
                            id="password"
                            name="password"
                            label="비밀번호"
                            placeholder="비밀번호"
                            type="password"
                            fullWidth
                            margin="normal"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon/>
                                        </InputAdornment>
                                    ),
                                    ...register('password', {
                                        required: errorMessage.passwordEmpty,
                                        validate: value => regexTest('password', value) || errorMessage.passwordRegex
                                    })
                                }
                            }}
                        />
                        <TextField
                            id="confirmPassword"
                            name="confirmPassword"
                            label="비밀번호 확인"
                            placeholder="비밀번호 재확인"
                            type="password"
                            fullWidth
                            margin="normal"
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon/>
                                        </InputAdornment>
                                    ),
                                    ...register('confirmPassword', {
                                        required: errorMessage.passwordConfirmEmpty,
                                        validate: value => value === password || errorMessage.passwordConfirmDisagree
                                    })
                                }
                            }}
                        />
                        <TextField
                            id="email"
                            name="email"
                            label="이메일 주소 (비밀번호 찾기 등 본인 확인용)"
                            placeholder="이메일"
                            type="email"
                            fullWidth
                            margin="normal"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon/>
                                        </InputAdornment>
                                    ),
                                    ...register('email', {
                                        required: errorMessage.emailEmpty,
                                        validate: value => regexTest('email',value) || errorMessage.emailRegex
                                    })
                                }
                            }}
                        />
                        <TextField
                            id="nickname"
                            name="nickname"
                            label="닉네임"
                            placeholder="닉네임"
                            type="text"
                            fullWidth
                            margin="normal"
                            error={!!errors.nickname}
                            helperText={errors.nickname?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FaceIcon/>
                                        </InputAdornment>
                                    ),
                                    ...register('nickname', {
                                        required: errorMessage.nicknameEmpty,
                                        validate: value => regexTest('nickname',value) || errorMessage.nicknameRegex
                                    })
                                }
                            }}
                        />

                        <Divider sx={{my: 2}}/>

                        <TextField
                            id="phone"
                            name="phone"
                            label="휴대전화번호 (선택 사항)"
                            placeholder="휴대전화 번호"
                            fullWidth
                            margin="normal"
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon/>
                                        </InputAdornment>
                                    ),
                                    ...register('phone', {
                                        validate: value => {
                                            if (!value) return true;
                                            return regexTest('phone',value) || errorMessage.phoneRegex;
                                        }
                                    })
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{mt: 2, mb: 2}}
                        >
                            회원가입
                        </Button>
                        <Box display="flex" justifyContent="end">
                            <Link href="/login" variant="body2" sx={{color: theme.palette.blue.main}}>
                                로그인
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Fade>
        </Container>
    );
}

export default Join;
