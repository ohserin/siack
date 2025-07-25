import {useForm} from 'react-hook-form';
import {TextField, Button, Box, Typography, Link, InputAdornment, Divider} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import React from "react";

const errorMessage = {
    usernameEmpty : "아이디: 필수 정보입니다.",
    passwordEmpty : "비밀번호: 필수 정보입니다.",
    passwordConfirmEmpty : "비밀번호확인: 필수 정보입니다.",
    emailEmpty : "이메일: 필수 정보입니다.",
    usernameRegex : "아이디: 아이디는 4~50자이며, 영문/숫자/특수문자(_, @)를 포함하고, 특정 특수문자는 연속으로 사용할 수 없습니다.",
    passwordRegex : "비밀번호: 비밀번호는 최소 8자 이상이며, 최소 하나의 소문자와 숫자를 포함해야 합니다.",
    passwordConfirmDisagree : "비밀번호확인: 비밀번호가 일치하지 않습니다.",
    emailRegex : "이메일: 이메일이 정확한지 확인해 주세요.",
    phoneRegex : "휴대전화번호: 휴대전화번호가 정확한지 확인해 주세요.",
    usernameDuplicate : "아이디: 이미 사용중인 아이디입니다.",
    emailDuplicate : "이메일: 이미 사용중인 이메일입니다.",
    phoneDuplicate : "휴대전화번호: 이미 사용중인 휴대전화번호입니다.",
}

const regexPatterns = {
    username: /^[a-zA-Z0-9_@]{4,50}$/, // 4~50자, 영문/숫자/특수문자(_, @) 포함
    // 비밀번호는 최소 8자 이상, 최소 하나의 소문자와 숫자를 포함
    password: /^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // 일반적인 이메일 형식
    phone: /^\d{3}-\d{3,4}-\d{4}$/, // 000-0000-0000 또는 000-000-0000 형식
};

// 정규식 테스트 함수들
function usernameRegexTest(value) {
    return regexPatterns.username.test(value);
}

function passwordRegexTest(value) {
    return regexPatterns.password.test(value);
}

function emailRegexTest(value) {
    return regexPatterns.email.test(value);
}

function phoneRegexTest(value) {
    return regexPatterns.phone.test(value);
}

function Join() {
    const {
        register,
        handleSubmit,
        watch,
        formState: {errors},
    } = useForm();

    // 비밀번호 필드의 현재 값을 watch하여 비밀번호 확인 필드 유효성 검사에 사용
    const password = watch('password', '');

    const onSubmit = (data) => {
        if (data.password !== data.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        console.log('회원가입 데이터:', data);
        alert('회원가입 성공!');
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
                    fullWidth
                    margin="normal"
                    {...register('username', {
                        required: errorMessage.usernameEmpty,
                        validate: value => usernameRegexTest(value) || errorMessage.usernameRegex
                    })}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon/>
                                </InputAdornment>
                            ),
                        }
                    }}
                />
                <TextField
                    label="비밀번호"
                    type="password"
                    fullWidth
                    margin="normal"
                    {...register('password', {
                        required: errorMessage.passwordEmpty,
                        validate: value => passwordRegexTest(value) || errorMessage.passwordRegex
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon/>
                                </InputAdornment>
                            ),
                        }
                    }}
                />
                <TextField
                    label="비밀번호 확인"
                    type="confirmPassword"
                    fullWidth
                    margin="normal"
                    {...register('confirmPassword', {
                        required: errorMessage.passwordConfirmEmpty,
                        validate: value =>
                            value === password || errorMessage.passwordConfirmDisagree
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon/>
                                </InputAdornment>
                            ),
                        }
                    }}
                />
                <TextField
                    label="이메일 주소 (비밀번호 찾기 등 본인 확인용)"
                    type="email"
                    fullWidth
                    margin="normal"
                    {...register('email', {
                        required: errorMessage.emailEmpty,
                        validate: value => emailRegexTest(value) || errorMessage.emailRegex
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon/>
                                </InputAdornment>
                            ),
                        }
                    }}
                />

                <Divider sx={{my: 2}}/>

                <TextField
                    label="휴대전화번호 (선택 사항)"
                    fullWidth
                    margin="normal"
                    {...register('phone', {
                        validate: value => {
                            if (!value) return true;
                            return phoneRegexTest(value) || errorMessage.phoneRegex;
                        }
                    })}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PhoneIcon/>
                                </InputAdornment>
                            ),
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
