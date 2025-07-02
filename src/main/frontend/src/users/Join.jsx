import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography } from '@mui/material';

function Join() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

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
            bgcolor="#fafafa"
        >
            <Typography variant="h4" component="h2" align="center" gutterBottom>
                회원가입
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <TextField
                    label="이름"
                    fullWidth
                    margin="normal"
                    {...register('name', { required: '이름을 입력해주세요.' })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />
                <TextField
                    label="이메일"
                    type="email"
                    fullWidth
                    margin="normal"
                    {...register('email', { required: '이메일을 입력해주세요.' })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />
                <TextField
                    label="핸드폰번호"
                    fullWidth
                    margin="normal"
                    {...register('phone', { required: '핸드폰번호를 입력해주세요.' })}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                />
                <TextField
                    label="아이디"
                    fullWidth
                    margin="normal"
                    {...register('username', { required: '아이디를 입력해주세요.' })}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                />
                <TextField
                    label="비밀번호"
                    type="password"
                    fullWidth
                    margin="normal"
                    {...register('password', { required: '비밀번호를 입력해주세요.' })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                />
                <TextField
                    label="비밀번호 확인"
                    type="password"
                    fullWidth
                    margin="normal"
                    {...register('confirmPassword', { required: '비밀번호 확인을 입력해주세요.' })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    회원가입
                </Button>
            </form>
        </Box>
    );
}

export default Join;
