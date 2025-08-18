import {useForm} from 'react-hook-form';
import React, {useState, useEffect} from 'react';
import {useAuth} from '../../contexts/AuthContext.jsx';
import {navigate} from "../../utils/navigation.js";
import {
    Container, Box, Typography, TextField, Button, Link, Paper, Fade, FormControlLabel, Checkbox, InputAdornment,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import {Avatar} from '@mui/material';
import api from "../../api/api.js";
import theme from '../../theme.js'

const errorMessage = {
    usernameEmpty: "아이디: 아이디를 입력해주세요.",
    passwordEmpty: "비밀번호: 비밀번호를 입력해주세요.",
    usernameRegex: "아이디: 아이디를 다시 확인해주세요.",
    passwordRegex: "비밀번호: 비밀번호를 다시 확인해주세요.",
}

const regexPatterns = {
    username: /^[a-zA-Z0-9_@]{4,50}$/, // 4~50자, 영문/숫자/특수문자(_, @) 포함
    // 비밀번호는 최소 8자 이상, 최소 하나의 소문자와 숫자를 포함
    password: /^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
}

function usernameRegexTest(value) {
    return regexPatterns.username.test(value);
}

function passwordRegexTest(value) {
    return regexPatterns.password.test(value);
}

async function loginUser(formData) {
    try {
        const response = await api.post('/v1/user/login', {
            username: formData.username,
            password: formData.password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: '서버 오류' };
    }
}

function Login() {
    const [showForm, setShowForm] = useState(false);
    const [rememberId, setRememberId] = useState(false);
    const { login, guard } = useAuth();

    const {
        register, // 입력 필드를 등록하는 함수
        handleSubmit, // 폼 제출을 처리하는 함수
        setError,
        formState: { errors }, // 폼 오류 상태를 포함하는 객체
    } = useForm();

    useEffect(() => {
        setShowForm(true);

        // 이미 로그인되어 있으면 홈으로 리디렉트
        guard(false, '/');

        const savedUsername = localStorage.getItem('savedUsername');
        if (savedUsername) {
            setRememberId(true);
        }
    }, []);

    const handleRememberIdChange = (event) => {
        setRememberId(event.target.checked);
    };

    const onSubmit = async (data) => {
        try {
            const loginResponse = await loginUser(data);

            if (rememberId) {
                localStorage.setItem('savedUsername', data.username); // "아이디 기억하기"가 체크되면 사용자 이름 저장
            } else {
                localStorage.removeItem('savedUsername'); // 체크 해제 시 저장된 사용자 이름 제거
            }

            login(loginResponse.token);
            navigate('/');
        } catch (error) {
            setError('username', { type: 'manual', message: "아이디 또는 비밀번호가 올바르지 않습니다." });
            setError('password', { type: 'manual', message: '' });
        }
    };

    return (
        <Container component="main" maxWidth={false} sx={{mt: 8, mb: 4, width: '100%', maxWidth: 450}}>
            <Fade in={showForm} timeout={1000}>
                <Paper elevation={3} sx={{p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <Avatar sx={{m: 1, bgcolor: 'primary.main', width: 60, height: 60}}>
                        <LockOutlinedIcon sx={{fontSize: 40}}/>
                    </Avatar>
                    <Typography component="h2" variant="h4" align="center" gutterBottom>
                        로그인
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField
                            id="username"
                            name="username"
                            autoComplete="username"
                            label="아이디"
                            placeholder="아이디"
                            autoFocus
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
                                    })
                                }
                            }}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            name="password"
                            label="비밀번호"
                            placeholder="비밀번호"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            sx={{mb: 1}}
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value="remember"
                                    color="primary"
                                    checked={rememberId}
                                    onChange={handleRememberIdChange}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{fontSize: '0.8rem'}}>
                                    아이디 기억하기
                                </Typography>
                            }
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 1, mb: 2}}
                        >
                            로그인
                        </Button>
                        <Box display="flex" justifyContent="space-between">
                            <Link href="#" variant="body2" sx={{color: theme.palette.blue.main}}>
                                비밀번호를 잊으셨나요?
                            </Link>
                            <Link href="/join" variant="body2" sx={{color: theme.palette.blue.main}}>
                                회원가입
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Fade>
        </Container>
    );
}

export default Login;