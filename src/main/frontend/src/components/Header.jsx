import {AppBar, Toolbar, Typography, Box, Button, IconButton, useMediaQuery} from '@mui/material';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import {useAuth} from "../contexts/AuthContext.jsx";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

function Header() {
    const navigate = useNavigate();
    const {user, logout, userData, loading} = useAuth();

    const isDesktop = useMediaQuery('(min-width:1080px)');
    const showBothButtons = useMediaQuery('(min-width:1215px)');
    const showOnlyLogin = useMediaQuery('(min-width:1080px) and (max-width:1214px)');
    const showHamburger = useMediaQuery('(max-width:1079px)');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static" color="primary">
            <Toolbar sx={{justifyContent: 'space-between'}}>
                <Box display="flex" alignItems="center">
                    <Typography variant="h6" component={RouterLink} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>
                        Siack
                    </Typography>
                    {isDesktop && (
                        <Box sx={{ml: 4, display: 'flex', gap: 2}}>
                            <Button color="inherit">서비스</Button>
                            <Button color="inherit">요금제</Button>
                            <Button color="inherit">문의</Button>
                        </Box>
                    )}
                </Box>

                <Box>
                    {user ? (
                        <Box display="flex" alignItems="center" gap={1}>
                            <AccountCircleIcon/>
                            <Typography variant="body1" sx={{mr: 2}}>
                                {userData?.nickname || ''}
                            </Typography>
                            <Button color="inherit" onClick={handleLogout}>
                                로그아웃
                            </Button>
                        </Box>
                    ) : showBothButtons ? (
                        <>
                            <Button color="inherit" component={RouterLink} to="/login">로그인</Button>
                            <Button color="inherit" component={RouterLink} to="/join">회원가입</Button>
                        </>
                    ) : showOnlyLogin ? (
                        <Button color="inherit" component={RouterLink} to="/login">로그인</Button>
                    ) : showHamburger && (
                        <IconButton color="inherit">
                            <MenuIcon/>
                        </IconButton>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
