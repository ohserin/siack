import Header from './components/Header';
// import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/users/Login.jsx';
import Join from "./pages/users/Join.jsx";
import {AuthProvider} from './contexts/AuthContext.jsx';
import {Box, Container} from '@mui/material';
import {Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import {setNavigator} from "./utils/navigation.js";
import {useEffect} from "react";
import {ModalProvider} from "./contexts/ModalContext.jsx";
import Contact from "./pages/Contact.jsx";
import UserSettingsPage from "./pages/users/settings/UserSettingsPage.jsx";
import DeletedAccount from './pages/users/DeletedAccount.jsx';
import {CreateWorkspace} from './pages/workspace';
import {Workspace} from './pages/workspace';

function App() {
    const nav = useNavigate();
    const location = useLocation();
    const hideHeader = location.pathname.startsWith('/workspace/room');

    useEffect(() => {
        setNavigator(nav);
    }, [nav]);

    return (
        <AuthProvider><ModalProvider>
            <Box display="flex" flexDirection="column" minHeight="100vh">
                {!hideHeader && <Header/>}
                <Container sx={{flex: 1}}>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/join" element={<Join/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/contact" element={<Contact/>}/>
                        <Route path="/user-setting" element={<UserSettingsPage/>}/>
                        <Route path="/account-deleted" element={<DeletedAccount/>}/>
                        <Route path="/workspace/create" element={<CreateWorkspace/>}/>
                        <Route path="/workspace/room/:roomId" element={<Workspace/>}/>
                    </Routes>
                </Container>
                {/*<Footer/>*/}
            </Box>
        </ModalProvider></AuthProvider>
    );
}

export default App;