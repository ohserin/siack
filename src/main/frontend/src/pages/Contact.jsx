import React, {useState, useEffect, useRef} from "react";
import api from "../api/api.js";
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    useMediaQuery,
    useTheme,
    IconButton,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {useModal} from "../contexts/ModalContext.jsx";
import {useAuth} from "../contexts/AuthContext.jsx";

const Contact = () => {
    const [posts, setPosts] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0); // 0부터 시작
    const [size, setSize] = useState(10); // 페이지당 게시글 수
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const writeButtonRef = useRef(null);
    const {showModal} = useModal();
    const {user, userData} = useAuth();


    const handleOpenWrite = () => {
        if (!user) {
            showModal("로그인이 필요합니다", "로그인 후 이용해 주세요.");
            return;
        }
        setOpen(true);
    };

    useEffect(() => {
        setSize(isMobile ? 5 : 10); // 모바일은 5개, 데스크탑은 10개
    }, [isMobile]);

    const fetchPosts = async (page = 0) => {
        try {
            const response = await api.get(`/v1/board/list?page=${page}&size=${size}`);
            // 서버에서 받은 데이터 구조에 맞게 변환
            const posts = response.data.content.map(post => ({
                boardId: post.boardId,
                title: post.title,
                content: post.content,
                author: post.nickname, // 닉네임을 author로 사용
                date: post.createdat ? new Date(post.createdat).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }).replace(/\.$/, '').replace(/(\d{4})\. (\d{2})\. (\d{2})\./, (m, y, mth, d) => `${y}.${mth}.${d}`) : '',
                dateTime: post.createdat ? new Date(post.createdat).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }).replace(/(\d{4})\. (\d{2})\. (\d{2})\./, (m, y, mth, d) => `${y}.${mth}.${d}`) : '',
                statusCode: post.statusCode,
                message: post.message,
            }));
            setPosts(posts);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            showModal("오류", "게시글 목록을 불러오지 못했습니다.");
        }
    };

    useEffect(() => {
        fetchPosts(page);
    }, [page, size]);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            showModal("입력 오류", "제목과 내용을 모두 입력해주세요.");
            return;
        }
        try {
            const response = await api.post("/v1/board/write", {
                title,
                content,
            });
            showModal("등록 완료", response.data?.message || "게시물이 등록되었습니다!");
            setOpen(false);
            setTitle("");
            setContent("");
            fetchPosts();
        } catch (error) {
            showModal({title: "오류", message: error.response?.data?.message || "게시물 등록 중 오류가 발생했습니다."});
        }
    };

    const handleViewPost = (post) => {
        setSelectedPost(post);
        setViewOpen(true);
    };

    // 페이지네이션 버튼 클릭 핸들러
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // 글 상세 모달 닫기 시 포커스 이동
    const handleCloseView = () => {
        setViewOpen(false);
    };

    // inert 속성 적용/해제 함수
    useEffect(() => {
        const root = document.getElementById('root');
        if (!root) return;
        // Dialog가 열릴 때만 적용
        if (open || viewOpen) {
            // Dialog 외의 모든 자식에 inert 적용
            Array.from(root.children).forEach(child => {
                // Dialog는 role="dialog"를 가짐
                if (!child.querySelector('[role="dialog"]')) {
                    child.setAttribute('inert', '');
                }
            });
        } else {
            // inert 해제
            Array.from(root.children).forEach(child => {
                child.removeAttribute('inert');
            });
        }
        // 클린업: unmount 시 inert 해제
        return () => {
            Array.from(root.children).forEach(child => {
                child.removeAttribute('inert');
            });
        };
    }, [open, viewOpen]);

    const myNickname = userData?.nickname?.trim();
    const isMyPost = myNickname && selectedPost?.author?.trim() === myNickname;

    return (
        <Box sx={{
            maxWidth: 900,
            mx: "auto",
            py: {xs: 2, md: 6},
            px: {xs: 1, sm: 2, md: 0},
            minHeight: "100vh",
            background: {xs: '#f8fafc', md: '#f4f6fa'},
        }}>
            <Box sx={{display: 'flex', alignItems: 'center', mb: {xs: 2, md: 4}}}>
                <Typography variant={isMobile ? "h5" : "h4"} sx={{fontWeight: 800, flex: 1, color: '#222'}}>
                    문의 게시판
                </Typography>
                <Button
                    ref={writeButtonRef}
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={handleOpenWrite}
                    sx={{
                        borderRadius: 1,
                        fontWeight: 700,
                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                        fontSize: {xs: 15, md: 16},
                        px: {xs: 2, md: 3},
                        py: {xs: 1, md: 1.2},
                    }}
                >
                    글쓰기
                </Button>
            </Box>

            {!isMobile && (
                <Box sx={{
                    background: '#fff',
                    borderRadius: 0,
                    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
                    overflow: 'hidden',
                }}>
                    <Box sx={{
                        display: 'flex',
                        px: 3,
                        py: 2,
                        borderBottom: '1px solid #e3e8f0',
                        fontWeight: 700,
                        color: '#7b8a9b',
                        fontSize: 15,
                    }}>
                        <Box sx={{flex: 1}}>제목</Box>
                        <Box sx={{width: 120, textAlign: 'center'}}>작성자</Box>
                        <Box sx={{width: 120, textAlign: 'center'}}>작성일</Box>
                        <Box sx={{width: 60, textAlign: 'center'}}></Box>
                    </Box>
                    {posts.map((post) => (
                        <Box key={post.boardId} sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 3,
                            py: 2,
                            borderBottom: post === posts[posts.length - 1] ? 'none' : '1px solid #f0f2f5',
                            '&:hover': {background: '#f8fafc'},
                            transition: 'background 0.15s',
                            borderRadius: 0, // 완전 직각
                        }}>
                            <Box sx={{
                                flex: 1,
                                fontWeight: 600,
                                color: '#222',
                                fontSize: 16,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                mr: 2,
                            }}>{post.title}</Box>
                            <Box sx={{
                                width: 120,
                                textAlign: 'center',
                                color: '#7b8a9b',
                                fontSize: 15,
                                flexShrink: 0
                            }}>{post.author}</Box>
                            <Box sx={{
                                width: 120,
                                textAlign: 'center',
                                color: '#7b8a9b',
                                fontSize: 15,
                                flexShrink: 0
                            }}>{post.date}</Box>
                            <Box sx={{width: 60, textAlign: 'center', flexShrink: 0}}>
                                <IconButton color="primary" size="small" sx={{
                                    borderRadius: 0,
                                    background: '#f4f6fa',
                                    '&:hover': {background: '#e3e8f0'}
                                }} onClick={() => handleViewPost(post)}>
                                    <VisibilityIcon fontSize="small"/>
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {/* 모바일: 카드형 리스트 뷰 */}
            {isMobile && (
                <Box sx={{
                    background: 'transparent',
                    borderRadius: 0,
                    boxShadow: 'none',
                    p: 0,
                }}>
                    {posts.map((post) => (
                        <Box key={post.boardId} sx={{
                            mb: 2,
                            borderRadius: 0,
                            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
                            background: '#fff',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            transition: 'box-shadow 0.15s',
                            '&:hover': {boxShadow: '0 4px 16px 0 rgba(0,0,0,0.10)'}
                        }}>
                            <Box sx={{
                                fontWeight: 700,
                                color: '#222',
                                fontSize: 16,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                mb: 0.5,
                            }}>{post.title}</Box>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Box sx={{color: '#7b8a9b', fontWeight: 400, fontSize: 13}}>
                                    {post.author} · {post.date}
                                </Box>
                                <IconButton color="primary" size="small" sx={{
                                    borderRadius: 0, // 완전 직각
                                    background: '#f4f6fa',
                                    '&:hover': {background: '#e3e8f0'}
                                }} onClick={() => handleViewPost(post)}>
                                    <VisibilityIcon fontSize="small"/>
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullScreen={isMobile}
                maxWidth={isMobile ? false : "sm"}
                slotProps={{
                    paper: {
                        sx: isMobile
                            ? {m: 0, width: "100%", height: "100%", borderRadius: 0, p: 0}
                            : {borderRadius: 0, p: 2},
                    }
                }}
            >
                <DialogTitle sx={{fontWeight: 800, fontSize: isMobile ? 19 : 22, pb: 1, color: '#222'}}>
                    글쓰기
                </DialogTitle>
                <DialogContent sx={{px: {xs: 2, sm: 4}, pt: 1, pb: 0}}>
                    <TextField
                        label="제목"
                        fullWidth
                        margin="normal"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{
                            mb: 2, background: '#f8fafc', borderRadius: 2,
                            '& .MuiInputBase-input': {fontSize: isMobile ? 15 : 16, fontWeight: 600}
                        }}
                    />
                    <TextField
                        label="내용"
                        fullWidth
                        multiline
                        rows={isMobile ? 8 : 6}
                        margin="normal"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        sx={{
                            mb: 2, background: '#f8fafc', borderRadius: 2,
                            '& .MuiInputBase-input': {fontSize: isMobile ? 15 : 16}
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{px: {xs: 2, sm: 4}, pb: {xs: 2, sm: 3}}}>
                    <Button
                        onClick={() => setOpen(false)}
                        size={isMobile ? "medium" : "large"}
                        sx={{fontWeight: 700, color: '#7b8a9b', borderRadius: 2}}
                    >
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        size={isMobile ? "medium" : "large"}
                        sx={{fontWeight: 700, px: 4, borderRadius: 2}}
                    >
                        등록
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 글 상세 보기 모달 */}
            <Dialog
                open={viewOpen}
                onClose={handleCloseView}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    transition: {
                        onExited: () => {
                            if (writeButtonRef.current) writeButtonRef.current.focus();
                        }
                    },
                    paper: {
                        sx: {borderRadius: 2, p: 2}
                    }
                }}
            >
                <DialogTitle sx={{
                    fontWeight: 800,
                    fontSize: isMobile ? 19 : 22,
                    color: '#222',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 'calc(100% - 48px)',
                    display: 'block',
                }}>
                    {selectedPost?.title || '게시글 상세'}
                </DialogTitle>
                <DialogContent sx={{px: {xs: 2, sm: 4}, pt: 1, pb: 0}}>
                    <Typography sx={{color: '#7b8a9b', fontSize: 15, mb: 1}}>
                        작성자: {selectedPost?.author} | 작성일: {selectedPost?.dateTime}
                    </Typography>
                    <Typography sx={{fontSize: 16, color: '#222', whiteSpace: 'pre-line', mt: 2}}>
                        {selectedPost?.content || '내용이 없습니다.'}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{px: {xs: 2, sm: 4}, pb: {xs: 2, sm: 3}}}>
                    {isMyPost && (
                        <>
                            <Button variant="outlined"  sx={{ borderColor:"#bdbdbd",color:"#757575", fontWeight: 700, mr: 1, borderRadius: 0}}>
                                수정
                            </Button>
                            <Button variant="outlined" color="error" sx={{fontWeight: 700, mr: 1, borderRadius: 0}}>
                                삭제
                            </Button>
                        </>

                    )}
                    <Button onClick={handleCloseView} variant="contained" color="primary"
                            sx={{fontWeight: 700, borderRadius: 0}}>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 페이지네이션 */}
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                {Array.from({length: Math.ceil(totalCount / size)}).map((_, idx) => (
                    <Button
                        key={idx}
                        variant={page === idx ? 'contained' : 'outlined'}
                        size="small"
                        sx={{mx: 0.5, minWidth: 36, borderRadius: 0}}
                        onClick={() => handlePageChange(idx)}
                    >
                        {idx + 1}
                    </Button>
                ))}
            </Box>
        </Box>
    );
};

export default Contact;
