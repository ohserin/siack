import {Button, Typography, Box} from '@mui/material';
import {useNavigate} from 'react-router-dom';

function DeletedAccount() {
    const navigate = useNavigate();
    return (
        <Box sx={{textAlign: 'center', mt: 10}}>
            <Typography variant="h4" gutterBottom>탈퇴가 완료되었습니다.</Typography>
            <Typography color="text.secondary" sx={{mt: 4, mb: 4}}>
                회원님의 계정이 정상적으로 탈퇴되었습니다.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/')}>홈으로</Button>
        </Box>
    );
}

export default DeletedAccount;

