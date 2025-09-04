import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/users/Login.jsx';
import Join from "./pages/users/Join.jsx";
import {AuthProvider} from './contexts/AuthContext.jsx';
import {Box, Container} from '@mui/material';
import {Routes, Route, useNavigate} from 'react-router-dom';
import {setNavigator} from "./utils/navigation.js";
import {useEffect} from "react";
import {ModalProvider} from "./contexts/ModalContext.jsx";
import UserSettingsPage from "./pages/users/settings/UserSettingsPage.jsx";
import DeletedAccount from './pages/users/DeletedAccount.jsx';

function App() {
    const nav = useNavigate();

    useEffect(() => {
        setNavigator(nav);
    }, [nav]);

    return (
        <AuthProvider><ModalProvider>
            <Box display="flex" flexDirection="column" minHeight="100vh">
                <Header/>
                <Container sx={{flex: 1}}>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/join" element={<Join/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/user-setting" element={<UserSettingsPage/>}/>
                        <Route path="/account-deleted" element={<DeletedAccount/>}/>
                    </Routes>
                </Container>
                <Footer/>
            </Box>
        </ModalProvider></AuthProvider>
    );
}

export default App;