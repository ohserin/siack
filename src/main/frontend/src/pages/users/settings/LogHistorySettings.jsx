import React, {useState, useEffect} from 'react';
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
    CircularProgress,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    FirstPage as FirstPageIcon,
    LastPage as LastPageIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import api from '../../../api/api';

const ITEMS_PER_PAGE = 10;

function LogHistorySettings() {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    useEffect(() => {
        setLoading(true);
        api.get(`/v1/logs/user?page=${page - 1}&size=${ITEMS_PER_PAGE}`)
            .then(response => {
                setLogs(response.data.content);
                setTotalPages(response.data.totalPages);
            })
            .catch(error => {
                console.error("로그 데이터를 불러오는 데 실패했습니다.", error);
            })
            .finally(() => setLoading(false));
    }, [page]);

    const formatTimestamp = (ts) => {
        if (!ts) return '';
        const date = new Date(ts);
        const year = date.getFullYear().toString().slice(2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const period = hours >= 12 ? '오후' : '오전';
        const formattedHours = hours % 12 || 12;

        return `${year}.${month}.${day} ${period} ${formattedHours}:${minutes}`;
    };

    const desktopView = (<TableContainer component={Paper} variant="outlined">
            <Table sx={{minWidth: 650}} aria-label="login history table">
                <TableHead sx={{backgroundColor: 'grey.100'}}>
                    <TableRow>
                        <TableCell align="center" sx={{fontWeight: 'bold'}}>지역</TableCell>
                        <TableCell align="center" sx={{fontWeight: 'bold'}}>아이피</TableCell>
                        <TableCell align="center" sx={{fontWeight: 'bold'}}>내용</TableCell>
                        <TableCell align="center" sx={{fontWeight: 'bold'}}>시간</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {logs.map((row) => (
                        <TableRow key={row.logid} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                            <TableCell align="center">{row.region}</TableCell>
                            <TableCell align="center">{row.ip}</TableCell>
                            <TableCell align="center">{row.content}</TableCell>
                            <TableCell align="center">{formatTimestamp(row.createdat)}</TableCell>
                        </TableRow>))}
                </TableBody>
            </Table>
        </TableContainer>);

    const mobileView = (<Box>
            {logs.map((row) => (<Paper key={row.logid} variant="outlined" sx={{p: 2, mb: 2}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1}}>
                        <Typography variant="body1" sx={{fontWeight: 'bold'}}>{row.content}</Typography>
                        <Typography variant="caption" color="text.secondary"
                                    sx={{flexShrink: 0, ml: 2}}>{formatTimestamp(row.createdat)}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {`지역: ${row.region} | IP: ${row.ip}`}
                    </Typography>
                </Paper>))}
        </Box>);

    // 페이지네이션 블록 계산 함수
    const getPaginationRange = () => {
        const blockSize = 10;
        const currentBlock = Math.floor((page - 1) / blockSize);
        const start = currentBlock * blockSize + 1;
        const end = Math.min(start + blockSize - 1, totalPages);
        return {start, end};
    };

    const handleFirst = () => setPage(1);
    const handleLast = () => setPage(totalPages);
    const handlePrevBlock = () => {
        const {start} = getPaginationRange();
        setPage(Math.max(1, start - 1));
    };
    const handleNextBlock = () => {
        const {start} = getPaginationRange();
        setPage(Math.min(totalPages, start + 10));
    };

    const renderCustomPagination = () => {
        if (totalPages <= 1) return null;
        const {start, end} = getPaginationRange();
        const mainColor = theme.palette.primary.main;
        const baseStyle = {
            px: 0.5,
            py: 0,
            m: 0,
            border: 'none',
            background: 'none',
            color: '#222',
            fontSize: isMobile ? 15 : 17,
            fontWeight: 'normal',
            minWidth: 'auto',
            minHeight: 'auto',
            boxShadow: 'none',
            outline: 'none',
            cursor: 'pointer',
            transition: 'color 0.15s',
            textDecoration: 'none',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            '&:hover:not(:disabled)': {
                color: theme.palette.primary.dark, textDecoration: 'none',
            },
            '&:disabled': {
                color: '#bbb', cursor: 'default', textDecoration: 'none',
            },
        };
        const activeStyle = {
            color: mainColor + ' !important', fontWeight: 'bold', textDecoration: 'none', cursor: 'default',
        };
        return (<Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mt: 3,
                gap: isMobile ? 0.2 : 0.5,
                flexWrap: isMobile ? 'nowrap' : 'wrap',
                overflowX: isMobile ? 'auto' : 'visible',
                maxWidth: isMobile ? '100vw' : 'none',
                whiteSpace: isMobile ? 'nowrap' : 'normal',
            }}>
                <Box component="button"
                     onClick={handleFirst}
                     disabled={page === 1}
                     sx={{...baseStyle, ...(page === 1 && {color: '#bbb', cursor: 'default'})}}>
                    <FirstPageIcon fontSize="small"/>
                </Box>
                <Box component="button"
                     onClick={handlePrevBlock}
                     disabled={start === 1}
                     sx={{...baseStyle, ...(start === 1 && {color: '#bbb', cursor: 'default'})}}>
                    <NavigateBeforeIcon fontSize="small"/>
                </Box>
                {Array.from({length: end - start + 1}, (_, idx) => {
                    const pageNum = start + idx;
                    return (<Box
                            key={pageNum}
                            component="button"
                            onClick={() => setPage(pageNum)}
                            disabled={page === pageNum}
                            sx={{
                                ...baseStyle, ...(page === pageNum && activeStyle), ...(page === pageNum ? {color: mainColor + ' !important'} : {}),
                            }}
                        >
                            {pageNum}
                        </Box>);
                })}
                <Box component="button"
                     onClick={handleNextBlock}
                     disabled={end === totalPages}
                     sx={{...baseStyle, ...(end === totalPages && {color: '#bbb', cursor: 'default'})}}>
                    <NavigateNextIcon fontSize="small"/>
                </Box>
                <Box component="button"
                     onClick={handleLast}
                     disabled={page === totalPages}
                     sx={{...baseStyle, ...(page === totalPages && {color: '#bbb', cursor: 'default'})}}>
                    <LastPageIcon fontSize="small"/>
                </Box>
            </Box>);
    };

    return (<Box>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                <Typography variant="h5" gutterBottom sx={{mb: 0, mr: 1}}>
                    로그 조회
                </Typography>
                <RefreshIcon
                    onClick={fetchLogs}
                    sx={{
                        cursor: loading ? 'not-allowed' : 'pointer',
                        color: loading ? 'grey.400' : 'grey.700',
                        transition: 'color 0.2s',
                        ml: 0.5
                    }}
                    fontSize="medium"
                    titleAccess="새로고침"
                />
            </Box>

            {loading ? (<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300}}>
                    <CircularProgress/>
                </Box>) : logs.length > 0 ? (isMobile ? mobileView : desktopView) : (
                <Paper variant="outlined" sx={{p: 5, textAlign: 'center'}}>
                    <Typography>로그 이력이 없습니다.</Typography>
                </Paper>)}

            {/* 페이지네이션 영역 */}
            {renderCustomPagination()}
        </Box>);
}

export default LogHistorySettings;
