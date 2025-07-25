import React, {useState, useEffect} from 'react';
import {
    Container, Box, Typography, TextField, Button, Link, Paper, Slide, Fade, FormControlLabel, Checkbox,
} from '@mui/material';

const usernameRegex = /^(?!.*[_.@]{2,})[a-zA-Z0-9][a-zA-Z0-9_@]{2,48}[a-zA-Z0-9]$/;
const passwordRegex = /^(?=.*[a-z])(?=.*\d)[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"|,.<>/?~]{8,}$/;

function Login() {
    const [showForm, setShowForm] = useState(false);
    const [rememberId, setRememberId] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        setShowForm(true);
    }, []); // 빈 배열은 컴포넌트가 처음 렌더링될 때 한 번만 실행됨을 의미합니다.

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('로그인 클릭');
        const formData = new FormData(event.currentTarget);
        const username = formData.get('username');
        const password = formData.get('password');

        // 입력 필드 유효성 검사
        let isValid = true;

        if (!usernameRegex.test(username)) {
            setUsernameError('아이디는 4~50자이며, 영문/숫자/특수문자(_, @)를 포함하고, 특정 특수문자는 연속으로 사용할 수 없습니다.');
            isValid = false;
        } else {
            setUsernameError('');
        }

        if (!passwordRegex.test(password)) {
            setPasswordError('비밀번호는 최소 8자 이상이며, 최소 하나의 소문자와 숫자를 포함해야 합니다.');
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (isValid) {
            if (rememberId) {
                localStorage.setItem('savedUsername', username);
            } else {
                localStorage.removeItem('savedUsername');
            }
        }
    };

    const handleRememberIdChange = (event) => {
        setRememberId(event.target.checked);
    };

    const handleUsernameChange = (event) => {
        const value = event.target.value;
        if (usernameError && usernameRegex.test(value)) {
            setUsernameError('');
        }
    };

    const handlePasswordChange = (event) => {
        const value = event.target.value;
        if (passwordError && passwordRegex.test(value)) {
            setPasswordError('');
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{mt: 8, mb: 4}}>
            <Slide direction="up" in={showForm} mountOnEnter unmountOnExit timeout={1000}>
                <Fade in={showForm} timeout={1000}>
                    <Paper elevation={3} sx={{p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Typography component="h1" variant="h5" sx={{mb: 1, textAlign: 'left', width: '100%'}}>
                            로그인
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="아이디"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                error={!!usernameError}
                                helperText={usernameError}
                                onChange={handleUsernameChange}
                                sx={{mb: 1 }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="비밀번호"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                error={!!passwordError}
                                helperText={passwordError}
                                onChange={handlePasswordChange}
                                sx={{mb: 1 }}
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
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                        로그인 상태 유지
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
                                <Link href="#" variant="body2">
                                    비밀번호를 잊으셨나요?
                                </Link>
                                <Link href="/join" variant="body2">
                                    회원가입
                                </Link>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>
            </Slide>
        </Container>
    );
}

export default Login;