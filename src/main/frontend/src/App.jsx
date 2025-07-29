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


function App() {
    const nav = useNavigate();

    useEffect(() => {
        setNavigator(nav);
    }, [nav]);

    return (
            <AuthProvider>
                <Box display="flex" flexDirection="column" minHeight="100vh">
                    <Header/>
                    <Container sx={{flex: 1, mt: 2}}>
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/join" element={<Join/>}/>
                            <Route path="/login" element={<Login/>}/>
                            {/* 추가 경로 여기에 작성 */}
                        </Routes>
                    </Container>
                    <Footer/>
                </Box>
            </AuthProvider>
    );
}

export default App;