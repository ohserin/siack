import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/users/Login.jsx';
import Join from "./pages/users/Join.jsx";
import ModifyProfile from "./pages/users/ModifyProfile.jsx";
import {AuthProvider} from './contexts/AuthContext.jsx';
import {Box, Container} from '@mui/material';
import {Routes, Route, useNavigate} from 'react-router-dom';
import {setNavigator} from "./utils/navigation.js";
import {useEffect} from "react";
import {ModalProvider} from "./contexts/ModalContext.jsx";

function App() {
    const nav = useNavigate();

    useEffect(() => {
        setNavigator(nav);
    }, [nav]);

    return (
        <AuthProvider><ModalProvider>
            <Box display="flex" flexDirection="column" minHeight="100vh">
                <Header/>
                <Container sx={{flex: 1, mt: 2}}>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/join" element={<Join/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/modify-profile" element={<ModifyProfile/>}/>
                    </Routes>
                </Container>
                <Footer/>
            </Box>
        </ModalProvider></AuthProvider>
    );
}

export default App;