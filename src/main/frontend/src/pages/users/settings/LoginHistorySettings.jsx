import React, { useState, useEffect } from 'react';
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
    useMediaQuery,
    CircularProgress
} from '@mui/material';
import api from '../../../api/api'; // API 인스턴스 임포트

const ITEMS_PER_PAGE = 10;

function LoginHistorySettings() {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/v1/logs/user?page=${page - 1}&size=${ITEMS_PER_PAGE}`);
                setLogs(response.data.content);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error("로그 데이터를 불러오는 데 실패했습니다.", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [page]);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const formatTimestamp = (ts) => {
        if (!ts) return '';
        const date = new Date(ts);
        const year = date.getFullYear().toString().slice(2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const period = hours >= 12 ? '오후' : '오전';
        const formattedHours = hours % 12 || 12; // 12시간 형식으로 변환

        return `${year}.${month}.${day} ${period} ${formattedHours}:${minutes}`;
    };

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
                    {logs.map((row) => (
                        <TableRow key={row.logid} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell align="center">{row.region}</TableCell>
                            <TableCell align="center">{row.ip}</TableCell>
                            <TableCell align="center">{row.content}</TableCell>
                            <TableCell align="center">{formatTimestamp(row.createdat)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const mobileView = (
        <Box>
            {logs.map((row) => (
                <Paper key={row.logid} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{row.content}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 2 }}>{formatTimestamp(row.createdat)}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {`지역: ${row.region} | IP: ${row.ip}`}
                    </Typography>
                </Paper>
            ))}
        </Box>
    );

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                로그인 이력
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                    <CircularProgress />
                </Box>
            ) : logs.length > 0 ? (
                isMobile ? mobileView : desktopView
            ) : (
                <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
                    <Typography>로그인 이력이 없습니다.</Typography>
                </Paper>
            )}

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
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
