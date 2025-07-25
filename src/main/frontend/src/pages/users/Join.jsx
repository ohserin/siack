import {useForm} from 'react-hook-form';
import {useNavigate} from 'react-router-dom';
import {TextField, Button, Box, Typography, Link, InputAdornment, Divider} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FaceIcon from '@mui/icons-material/Face';
import React from "react";
import api from "../../api/api.js";

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

const regexPatterns = {
    username: /^[a-zA-Z0-9_@]{4,50}$/, // 4~50자, 영문/숫자/특수문자(_, @) 포함
    // 비밀번호는 최소 8자 이상, 최소 하나의 소문자와 숫자를 포함
    password: /^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // 일반적인 이메일 형식
    phone: /^\d{3}-\d{3,4}-\d{4}$/, // 000-0000-0000 또는 000-000-0000 형식
    nickname: /^[a-zA-Z0-9가-힣_]{2,30}$/
};

function usernameRegexTest(value) {
    return regexPatterns.username.test(value);
}

function passwordRegexTest(value) {
    return regexPatterns.password.test(value);
}

function emailRegexTest(value) {
    return regexPatterns.email.test(value);
}

function nicknameRegexTest(value) {
    return regexPatterns.nickname.test(value);
}

function phoneRegexTest(value) {
    return regexPatterns.phone.test(value);
}

async function checkUsernameDuplicate(username, setError) {
    if (!usernameRegexTest(username)) {
        setError('username', {type: 'pattern', message: errorMessage.usernameRegex});
        return false;
    }
    try {
        await api.get('/v1/user/check-username', {params: {username}});
        return true;
    } catch (error) {
        if (error.response?.status === 409) {
            setError('username', {type: 'duplicate', message: errorMessage.usernameDuplicate});
        } else if (error.response?.status === 400) {
            setError('username', {type: 'pattern', message: errorMessage.usernameRegex});
        } else {
            alert('서버 오류가 발생했습니다.');
        }
        return false;
    }
}

async function checkEmailDuplicate(email, setError) {
    if (!emailRegexTest(email)) {
        setError('email', {type: 'pattern', message: errorMessage.emailRegex});
        return false;
    }

    try {
        await api.get('/v1/user/check-email', {params: {email}});
        return true;
    } catch (error) {
        if (error.response?.status === 409) {
            setError('email', {type: 'duplicate', message: errorMessage.emailDuplicate});
        } else if (error.response?.status === 400) {
            setError('email', {type: 'pattern', message: errorMessage.emailRegex});
        } else {
            alert('서버 오류가 발생했습니다.');
        }
        return false;
    }
}

async function checkNicknameDuplicate(nickname, setError) {

    if (!nicknameRegexTest(nickname)) {
        setError('nickname', {type: 'nickname', message: errorMessage.nicknameRegex});
        return false;
    }

    try {
        await api.get('/v1/user/check-nickname', {params: {nickname}});
        return true;
    } catch (error) {
        if (error.response?.status === 409) {
            setError('nickname', {type: 'duplicate', message: errorMessage.nicknameDuplicate});
        } else if (error.response?.status === 400) {
            setError('nickname', {type: 'pattern', message: errorMessage.nicknameRegex});
        } else {
            alert('서버 오류가 발생했습니다.');
        }
        return false;
    }
}

async function checkPhoneDuplicate(phone, setError) {
    if (!phone) return true;

    if (!phoneRegexTest(phone)) {
        setError('phone', {type: 'pattern', message: errorMessage.phoneRegex});
        return false;
    }

    try {
        await api.get('/v1/user/check-phone', {params: {phone}});
        return true;
    } catch (error) {
        if (error.response?.status === 409) {
            setError('phone', {type: 'duplicate', message: errorMessage.phoneDuplicate});
        } else if (error.response?.status === 400) {
            setError('phone', {type: 'pattern', message: errorMessage.phoneRegex});
        } else {
            alert('서버 오류가 발생했습니다.');
        }
        return false;
    }
}

async function registerUser(formData) {
    try {
        const response = await api.post('/v1/user/register', {
            username: formData.username,
            password: formData.password,
            email: formData.email,
            phone: formData.phone,
            nickname: formData.nickname,
        });
        return response.data; // 성공 시 반환 데이터
    } catch (error) {
        // 실패 시 예외 던짐
        throw error.response?.data || { message: '서버 오류' };
    }
}

function Join() {
    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: {errors},
    } = useForm();

    const navigate = useNavigate();

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
        <Box
            maxWidth={400}
            mx="auto"
            mt={5}
            p={3}
            boxShadow={3}
            borderRadius={2}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <AccountCircleIcon sx={{fontSize: 60, color: 'primary.main', mb: 2}}/>
            <Typography variant="h4" component="h2" align="center" gutterBottom>
                회원가입
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <TextField
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
                                validate: value => usernameRegexTest(value) || errorMessage.usernameRegex
                            }),
                        },
                    }}
                />
                <TextField
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
                                validate: value => passwordRegexTest(value) || errorMessage.passwordRegex
                            })
                        }
                    }}
                />
                <TextField
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
                        },
                    }}
                />
                <TextField
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
                                validate: value => emailRegexTest(value) || errorMessage.emailRegex
                            })
                        }
                    }}
                />
                <TextField
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
                                    <FaceIcon />
                                </InputAdornment>
                            ),
                            ...register('nickname', {
                                required: errorMessage.nicknameEmpty,
                                validate: value => nicknameRegexTest(value) || errorMessage.nicknameRegex
                            })
                        }
                    }}
                />

                <Divider sx={{my: 2}}/>

                <TextField
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
                                    return phoneRegexTest(value) || errorMessage.phoneRegex;
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
                    <Link href="/Login" variant="body2">
                        로그인
                    </Link>
                </Box>

            </form>
        </Box>
    );
}

export default Join;
