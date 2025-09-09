import React from "react";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import { Box, Typography, Button, Paper, Avatar } from '@mui/material';
import theme from "../theme.js";
import { useModal } from "../contexts/ModalContext";

function Home() {
    const { showModal } = useModal();

    // 더미 데이터
    const workspaces = [
        {
            name: "임시 워크스페이스",
            icon: "💻",
            members: [
                { id: 1, name: "Alice", avatar: "🧑" },
                { id: 2, name: "Bob", avatar: "👩" },
                { id: 3, name: "Charlie", avatar: "🧔" },
                { id: 4, name: "Dana", avatar: "👩‍🦰" },
            ],
        },
        {
            name: "디자인팀",
            icon: "🎨",
            members: [
                { id: 5, name: "Eve", avatar: "👩‍🎤" },
                { id: 6, name: "Frank", avatar: "🧑‍" },
                { id: 7, name: "Grace", avatar: "👩‍💻" },
            ],
        },
    ];

    // 모달 오픈 핸들러
    const handleDevModal = () => {
        showModal(
            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                <BuildRoundedIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                개발중
            </Box>,
            "준비중인 기능입니다."
        );
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8f9fa', mt: 2 }}>
            {/* 안내 문구 */}
            <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', pt: 4, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={800} sx={{ m: 0, color: theme.palette.secondary.main, letterSpacing: -1 }}>
                    Siack에 오신 것을 환영합니다!
                </Typography>
                <Typography sx={{ color: '#555', fontSize: 16, mt: 1.25, mb: 2.25 }}>
                    워크스페이스를 선택하거나 새로 만들어 시작해보세요.
                </Typography>
            </Box>
            <Box sx={{ p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {workspaces.map((workspace) => (
                    <Paper key={workspace.name} elevation={1} sx={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#fff',
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                        p: { xs: '20px 3vw', sm: '24px 5vw' },
                        minWidth: 260,
                        maxWidth: 420,
                        width: '90vw',
                        mb: 3,
                        boxSizing: 'border-box',
                    }}>
                        <Box sx={{ fontSize: 36, mr: 2 }}>{workspace.icon}</Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={700} fontSize={22}>{workspace.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                {workspace.members.slice(0, 3).map((m, idx) => (
                                    <Avatar
                                        key={m.id}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            fontSize: 20,
                                            bgcolor: '#eee',
                                            border: '2px solid #fff',
                                            ml: idx === 0 ? 0 : -1.2,
                                            zIndex: 10 - idx,
                                        }}
                                    >
                                        {m.avatar}
                                    </Avatar>
                                ))}
                                {workspace.members.length > 3 && (
                                    <Typography sx={{ ml: 2.5, fontSize: 15, color: '#888', zIndex: 0 }}>
                                        +{workspace.members.length - 3}명
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <ArrowForwardIosIcon sx={{ fontSize: 24, color: '#bbb', ml: 2, cursor: 'pointer' }} onClick={handleDevModal} />
                    </Paper>
                ))}
                <Button
                    variant="contained"
                    color="secondary"
                    sx={{ borderRadius: 2, py: 1.2, px: 4, fontSize: 16, fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', mt: 2 }}
                    onClick={handleDevModal}
                >
                    새 워크스페이스 만들기
                </Button>
            </Box>
        </Box>
    );
}

export default Home;