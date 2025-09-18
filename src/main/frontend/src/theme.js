import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
    palette: {
        primary: { main: '#611f69' },
        secondary: { main: '#4A154B' },
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
        grey:{
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
        }

    },
    breakpoints: {
        values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }
    },
    spacing: 8,
    typography: {
        fontFamily: '"Noto Sans KR", Roboto, sans-serif',
        fontSize: 14,
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        body1: { fontSize: '1rem' },
        button: { textTransform: 'none' }, // 버튼 대문자 비활성화
    }
});

// 반응형 폰트 크기 적용
theme = responsiveFontSizes(theme);

export default theme;