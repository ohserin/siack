import React, { useState } from "react";
import { Box, Typography, Button, Paper, TextField } from "@mui/material";
import theme from "@/theme";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";

function JoinWorkspace() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        // 영문, 숫자만 허용, 최대 12자
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase();
        setCode(value);
        setError("");
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase();
        setCode(paste);
        setError("");
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (code.length !== 12) {
            setError("참여 코드는 12자리여야 합니다.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const { data } = await api.post("/v1/workspace/join", { code });
            if (data.statusCode === 200) {
                navigate("/");
            } else {
                setError(data.message || "참여에 실패했습니다.");
            }
        } catch (err) {
            const status = err?.response?.data?.statusCode;
            if (status === 404) {
                setError("유효하지 않은 초대코드입니다.");
            } else if (status === 409) {
                setError("이미 참여한 워크스페이스입니다.");
            } else {
                setError(err?.response?.data?.message || "참여에 실패했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="main" sx={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#f8f9fa',
            pt: 8
        }}>
            <Paper elevation={2} sx={{
                p: { xs: 4, sm: 6 },
                borderRadius: 3,
                minWidth: 280,
                maxWidth: 400,
                width: '90vw',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: theme.palette.secondary.main, mb: 2 }}>
                    워크스페이스 참여코드를 입력하세요
                </Typography>
                <TextField
                    placeholder="참여코드를 입력하세요."
                    value={code}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    sx={{ width: '100%', mb: 2, mt: 1 }}
                    autoFocus
                    error={!!error}
                    helperText={error || "12자리 영문/숫자"}
                    disabled={loading}
                    autoComplete="off"
                />
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        borderRadius: 2,
                        py: 1.2,
                        px: 4,
                        fontSize: 16,
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                        mt: 1
                    }}
                    onClick={handleSubmit}
                    disabled={loading || code.length !== 12}
                    fullWidth
                >
                    참여하기
                </Button>
            </Paper>
        </Box>
    );
}

export default JoinWorkspace;
