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

// 오류 메시지 정의
const errorMessage = {
    usernameEmpty: "아이디: 아이디를 입력해주세요.",
    passwordEmpty: "비밀번호: 비밀번호를 입력해주세요.",
    usernameRegex: "아이디: 아이디를 다시 확인해주세요.",
    passwordRegex: "비밀번호: 비밀번호를 다시 확인해주세요.",
}

// 유효성 검사를 위한 정규식 패턴
const regexPatterns = {
    username: /^[a-zA-Z0-9_@]{4,50}$/, // 4~50자, 영문/숫자/특수문자(_, @) 포함
    password: /^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, // 최소 8자 이상, 최소 하나의 소문자와 숫자를 포함
}

// 아이디 유효성 검사 함수
function usernameRegexTest(value) {
    return regexPatterns.username.test(value);
}

// 비밀번호 유효성 검사 함수
function passwordRegexTest(value) {
    return regexPatterns.password.test(value);
}

// 로그인 API 호출 함수
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
    const [rememberId, setRememberId] = useState(false); // "아이디 기억하기" 체크박스 상태
    const { login, guard } = useAuth();

    const {
        register,       // 입력 필드를 react-hook-form에 등록
        handleSubmit,   // 폼 제출 처리
        setError,       // 오류 상태 설정
        setValue,       // 필드 값을 동적으로 설정
        formState: { errors }, // 폼 오류 상태
    } = useForm();

    useEffect(() => {
        setShowForm(true);
        guard(false, '/'); // 이미 로그인된 사용자는 홈으로 리디렉션

        // 로컬 스토리지에서 앱 고유의 키로 저장된 아이디를 확인합니다.
        const savedUsername = localStorage.getItem('siack_savedUsername');
        if (savedUsername) {
            // 저장된 아이디가 있으면, 입력 필드에 값을 설정하고
            setValue('username', savedUsername);
            // "아이디 기억하기" 체크박스를 활성화합니다.
            setRememberId(true);
        }
    }, [setValue, guard]); // 의존성 배열에 setValue와 guard 추가

    // "아이디 기억하기" 체크박스 변경 핸들러
    const handleRememberIdChange = (event) => {
        setRememberId(event.target.checked);
    };

    // 폼 제출 시 실행되는 함수
    const onSubmit = async (data) => {
        try {
            const loginResponse = await loginUser(data);

            // "아이디 기억하기"가 체크된 경우
            if (rememberId) {
                // 로컬 스토리지에 앱 고유의 키로 아이디를 저장합니다.
                localStorage.setItem('siack_savedUsername', data.username);
            } else {
                // 체크되지 않은 경우, 저장된 아이디를 제거합니다.
                localStorage.removeItem('siack_savedUsername');
            }

            login(loginResponse.token); // 로그인 처리
            navigate('/'); // 홈으로 이동
        } catch (error) {
            // 로그인 실패 시 오류 메시지 설정
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