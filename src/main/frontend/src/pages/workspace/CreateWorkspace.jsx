import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper, Divider, Avatar, Fade } from "@mui/material";
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from "react-router-dom";
import theme from "../../theme";
import api from "../../api/api";
import { useModal } from "../../contexts/ModalContext";

function CreateWorkspace() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showModal } = useModal();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!name.trim()) {
            setError("워크스페이스 이름을 입력하세요.");
            return;
        }
        setLoading(true);
        try {
            await api.post("/v1/workspace/create", { name, description });
            setLoading(false);
            showModal(
                <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
                        성공적으로 생성되었습니다!
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ fontWeight: 700, fontSize: 16, px: 4, py: 1.2, borderRadius: 2 }}
                        onClick={() => navigate("/")}
                    >
                        홈으로 이동하기
                    </Button>
                </Box>
            );
        } catch (err) {
            setLoading(false);
            setError(err?.response?.data?.message || "워크스페이스 생성에 실패했습니다.");
        }
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(135deg, #f8f9fa 60%, #e3e6f3 100%)', pt: 7 }}>
            <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, minWidth: 320, maxWidth: 420, width: '92vw', boxShadow: '0 4px 24px rgba(80,100,200,0.08)', position: 'relative', overflow: 'visible' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 64, height: 64, mb: 1, boxShadow: '0 2px 8px #b3b3b3' }}>
                        <WorkspacePremiumRoundedIcon sx={{ fontSize: 38, color: '#fff' }} />
                    </Avatar>
                    <Typography variant="h5" fontWeight={900} sx={{ color: theme.palette.secondary.main, mb: 0.5, letterSpacing: -1 }}>
                        워크스페이스 생성
                    </Typography>
                    <Typography sx={{ color: '#666', fontSize: 15, mb: 1.5, textAlign: 'center' }}>
                        팀, 프로젝트, 동아리 등 다양한 공간을 만들어<br />협업을 시작해보세요.
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <form onSubmit={handleSubmit} autoComplete="off">
                    <TextField
                        label={<span style={{fontWeight:700}}>워크스페이스 이름</span>}
                        placeholder="예) 디자인팀, 2025 프로젝트"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        fullWidth
                        required
                        autoFocus
                        sx={{ mb: 2, background: '#fafbff', borderRadius: 2 }}
                        inputProps={{ maxLength: 30 }}
                    />
                    <TextField
                        label={<span style={{fontWeight:700}}>설명 <span style={{color:'#aaa', fontWeight:400}}>(선택)</span></span>}
                        placeholder="워크스페이스의 목적이나 소개를 적어주세요."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        sx={{ mb: 2, background: '#fafbff', borderRadius: 2 }}
                        inputProps={{ maxLength: 100 }}
                    />
                    <Fade in={!!error} unmountOnExit>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <InfoOutlinedIcon color="error" sx={{ mr: 1, fontSize: 20 }} />
                            <Typography color="error" sx={{ fontWeight: 600, fontSize: 15 }}>{error}</Typography>
                        </Box>
                    </Fade>
                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        fullWidth
                        sx={{ py: 1.3, fontWeight: 800, fontSize: 17, letterSpacing: -0.5, mt: 1, boxShadow: '0 2px 8px #b3b3b3', transition: '0.2s', ':hover': { background: theme.palette.secondary.dark } }}
                        disabled={loading}
                    >
                        {loading ? '생성 중...' : '워크스페이스 생성하기'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}

export default CreateWorkspace;
