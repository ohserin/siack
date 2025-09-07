import React, { useState } from "react";
import api from "../api/api.js";
import {
    Box,
    Typography,
    Grid,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";



// 샘플 게시글 데이터
const posts = [
    { id: 1, title: "첫 번째 게시글", author: "세린", date: "2025-08-29" },
    { id: 2, title: "두 번째 게시글", author: "오", date: "2025-08-28" },
    { id: 3, title: "세 번째 게시글", author: "김", date: "2025-08-27" },
    { id: 4, title: "네 번째 게시글", author: "이", date: "2025-08-26" },
];


const Contact = () => {

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        try {
            const response = await api.post("/board-write", {
                title,
                content,
                author,
            });
            alert(response.data?.message || "게시물이 등록되었습니다!");
            setOpen(false);
            setTitle("");
            setContent("");

            // 게시글 리스트 갱신
            fetchPosts();
        } catch (error) {
            alert(error.response?.data?.message || "게시물 등록 중 오류가 발생했습니다.");
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                문의 게시판
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpen(true)} // 모달 열기
                >
                    글쓰기
                </Button>
            </Box>


            {/* 데스크탑용 테이블 */}
            <TableContainer component={Paper} sx={{ display: { xs: "none", md: "block" } }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell>작성자</TableCell>
                            <TableCell>작성일</TableCell>
                            <TableCell align="center">내용</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {posts.map((post) => (
                            <TableRow key={post.id}>
                                <TableCell>{post.id}</TableCell>
                                <TableCell>{post.title}</TableCell>
                                <TableCell>{post.author}</TableCell>
                                <TableCell>{post.date}</TableCell>
                                <TableCell align="center">
                                    <Button variant="contained" size="small">
                                        보기
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 모바일용 카드형 그리드 */}
            <Grid container spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
                {posts.map((post) => (
                    <Grid item xs={12} key={post.id}>
                        <Paper sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                            <Typography variant="h6">{post.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                작성자: {post.author}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                작성일: {post.date}
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                                <Button variant="contained" size="small">
                                    보기
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>글쓰기</DialogTitle>
                <DialogContent>
                    <TextField
                        label="제목"
                        fullWidth
                        margin="normal"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        label="내용"
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>취소</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        등록
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Contact;
