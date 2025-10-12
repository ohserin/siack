import Header from './components/Header';
import {AuthProvider} from './contexts/AuthContext.jsx';
import {Box, Container} from '@mui/material';
import {Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import {setNavigator} from "./utils/navigation.js";
import {useEffect} from "react";
import {ModalProvider} from "./contexts/ModalContext.jsx";
import routes from './routes';

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
                <Container maxWidth={false} disableGutters sx={{flex: 1, px: 0}}>
                    <Routes>
                        {routes.map(({ path, element }, index) => (
                            <Route key={index} path={path} element={element} />
                        ))}
                    </Routes>
                </Container>
            </Box>
        </ModalProvider></AuthProvider>
    );
}

export default App;