import React, { useState } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    useTheme,
    useMediaQuery
} from '@mui/material';

// 임시 데이터
const createData = (id, region, ip, content, time) => {
    return { id, region, ip, content, time };
}

const rows = [
    createData(1, '서울', '211.123.456.789', '로그인 성공', '2023-10-27 10:00:00'),
    createData(2, '부산', '112.987.654.321', '로그인 성공', '2023-10-27 09:30:00'),
    createData(3, '서울', '211.123.456.789', '비밀번호 변경 시도', '2023-10-26 15:00:00'),
    createData(4, '대구', '192.168.1.1', '로그인 성공', '2023-10-26 14:20:00'),
    createData(5, '광주', '101.202.303.404', '로그인 실패', '2023-10-26 11:05:00'),
    createData(6, '서울', '211.123.456.789', '로그인 성공', '2023-10-25 18:45:00'),
    createData(7, '제주', '123.456.789.101', '로그인 성공', '2023-10-25 12:00:00'),
    createData(8, '서울', '211.123.456.789', '로그아웃', '2023-10-25 11:30:00'),
    createData(9, '강원', '222.111.000.999', '로그인 성공', '2023-10-24 22:10:00'),
    createData(10, '서울', '211.123.456.789', '로그인 성공', '2023-10-24 09:00:00'),
    createData(11, '경기', '192.168.0.1', '로그인 성공', '2023-10-23 14:00:00'),
];

const ITEMS_PER_PAGE = 10;

function LoginHistorySettings() {
    const [page, setPage] = useState(1);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const count = Math.ceil(rows.length / ITEMS_PER_PAGE);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const paginatedRows = rows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const desktopView = (
        <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }} aria-label="login history table">
                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                    <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>지역</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>아이피</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>내용</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>시간</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedRows.length > 0 ? (
                        paginatedRows.map((row) => (
                            <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell align="center">{row.region}</TableCell>
                                <TableCell align="center">{row.ip}</TableCell>
                                <TableCell align="center">{row.content}</TableCell>
                                <TableCell align="center">{row.time}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                <Typography>로그인 이력이 없습니다.</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const mobileView = (
        <Box>
            {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => (
                    <Paper key={row.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{row.content}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 2 }}>{row.time}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {`지역: ${row.region} | IP: ${row.ip}`}
                        </Typography>
                    </Paper>
                ))
            ) : (
                <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
                    <Typography>로그인 이력이 없습니다.</Typography>
                </Paper>
            )}
        </Box>
    );

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                로그인 이력
            </Typography>
            
            {isMobile ? mobileView : desktopView}

            {count > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={count}
                        page={page}
                        onChange={handleChangePage}
                        color="primary"
                        size={isMobile ? 'small' : 'medium'}
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </Box>
    );
}

export default LoginHistorySettings;
