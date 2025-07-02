import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import { Box, Container } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <Box display="flex" flexDirection="column" minHeight="100vh">
                <Header />
                <Container sx={{ flex: 1, mt: 2 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        {/* 추가 경로 여기에 작성 */}
                    </Routes>
                </Container>
                <Footer />
            </Box>
        </BrowserRouter>
    );
}

export default App;