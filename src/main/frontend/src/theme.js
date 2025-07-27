import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: { main: '#611f69' },
        secondary: { main: '#9c27b0' },
        error: { main: '#df3526' },
        background: {
            default: '#f5f5f5', // 페이지 배경색
            paper: '#ffffff',   // 카드, 다이얼로그 배경색
        },
        text: {
            primary: '#000000',
            secondary: '#666666',
        },
        mode: 'light', // 또는 'dark'

        blue: {
            main: '#1976d2',
            light: '#63a4ff',
            dark: '#004ba0',
            contrastText: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Noto Sans KR", Roboto, sans-serif',
        fontSize: 14,
        h1: { fontSize: '2.5rem', fontWeight: 700 },
        h2: { fontSize: '2rem' },
        body1: { fontSize: '1rem' },
        button: { textTransform: 'none' }, // 버튼 대문자 비활성화
    }
});

export default theme;