import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // 예시용 아이콘 (로고 대체 가능)

function Header() {
    return (
        <AppBar position="static" color="primary">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* 왼쪽: 로고/아이콘 */}
                <Box display="flex" alignItems="center">
                    <IconButton edge="start" color="inherit" sx={{ mr: 1 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div">
                        Siack
                    </Typography>
                </Box>

                {/* 오른쪽: 로그인/회원가입 */}
                <Box>
                    <Button color="inherit">로그인</Button>
                    <Button color="inherit">회원가입</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;