import React, {useEffect, useState} from "react";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {Box, Typography, Button, Paper, Avatar} from '@mui/material';
import theme from "../theme.js";
import {useNavigate} from "react-router-dom";
import api from "../api/api";
import {useAuth} from "../contexts/AuthContext";

function Home() {
    const navigate = useNavigate();
    const {userData} = useAuth();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showNicknameIdx, setShowNicknameIdx] = useState(null);
    const [confirmModal, setConfirmModal] = useState({open: false, workspaceId: null});
    const [resultModal, setResultModal] = useState({open: false, title: '', message: ''});
    const [profileImages, setProfileImages] = useState({});
    const requestQueueRef = React.useRef([]);
    const requestingSetRef = React.useRef(new Set());
    const requestedSetRef = React.useRef(new Set());
    const MAX_CONCURRENT_REQUESTS = 5;

    // 모바일 환경 감지
    const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // 로그인 상태가 아니면 워크스페이스를 로드하지 않고 안내 문구만 표시
    const isLoggedIn = !!userData;

    useEffect(() => {
        if (!isLoggedIn) return;
        setLoading(true);
        api.get("/v1/workspace/list")
            .then(res => {
                setWorkspaces(res.data || []);
                setLoading(false);
            })
            .catch(() => {
                setError("워크스페이스 목록을 불러오지 못했습니다.");
                setLoading(false);
            });
    }, [isLoggedIn]);

    useEffect(() => {
        // 모든 워크스페이스의 사용자 id를 수집
        const allUserIds = workspaces.flatMap(ws => (ws.users || []).slice(0, 3).map(u => u.id));
        const uniqueUserIds = Array.from(new Set(allUserIds));
        // 새로 요청해야 하는 id만 큐에 추가
        uniqueUserIds.forEach(userid => {
            if (!userid) return;
            if (profileImages[userid] !== undefined) return;
            if (requestedSetRef.current.has(userid)) return;
            if (requestQueueRef.current.includes(userid)) return;
            requestQueueRef.current.push(userid);
        });
        // 요청 처리 함수
        const processQueue = () => {
            while (
                requestQueueRef.current.length > 0 &&
                requestingSetRef.current.size < MAX_CONCURRENT_REQUESTS
                ) {
                const userid = requestQueueRef.current.shift();
                if (!userid) continue;
                requestingSetRef.current.add(userid);
                api.get('/v1/user/profileImg', {params: {userid}})
                    .then(res => {
                        setProfileImages(prev => ({...prev, [userid]: res.data.url || null}));
                    })
                    .catch(() => {
                        setProfileImages(prev => ({...prev, [userid]: null}));
                    })
                    .finally(() => {
                        requestingSetRef.current.delete(userid);
                        requestedSetRef.current.add(userid);
                        processQueue();
                    });
            }
        };
        processQueue();
    }, [workspaces, profileImages]);

    // 워크스페이스 생성 페이지 이동 핸들러
    const handleCreateWorkspace = () => {
        navigate("/workspace/create");
    };

    // 모바일에서 바깥 터치 시 닉네임 닫기 (map 바깥에서 관리)
    React.useEffect(() => {
        if (!isMobile || showNicknameIdx === null) return;
        const close = () => setShowNicknameIdx(null);
        document.addEventListener('touchstart', close);
        return () => document.removeEventListener('touchstart', close);
    }, [isMobile, showNicknameIdx]);

    // 삭제 버튼 클릭 시 확인 모달 오픈
    const openDeleteConfirm = (workspaceId) => {
        setConfirmModal({open: true, workspaceId});
    };
    // 삭제 확인 모달에서 삭제 진행
    const handleDeleteConfirmed = async () => {
        const workspaceId = confirmModal.workspaceId;
        setConfirmModal({open: false, workspaceId: null});
        try {
            await api.delete(`/v1/workspace/${workspaceId}`);
            setWorkspaces(prev => prev.filter(w => w.workspaceId !== workspaceId));
            setResultModal({open: true, title: '삭제가 완료되었습니다', message: ''});
        } catch (err) {
            setResultModal({open: true, title: '삭제에 실패했습니다.', message: err?.response?.data?.message || ''});
        }
    };
    // 삭제 확인 모달에서 취소
    const handleDeleteCancel = () => {
        setConfirmModal({open: false, workspaceId: null});
    };
    // 결과 모달 닫기
    const handleResultModalClose = () => {
        setResultModal({open: false, title: '', message: ''});
    };

    return (
        <Box component="main" sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#f8f9fa',
            mt: 2
        }}>
            {/* 안내 문구 */}
            <Box sx={{width: '100%', maxWidth: 480, mx: 'auto', pt: 4, textAlign: 'center'}}>
                <Typography variant="h5" fontWeight={800}
                            sx={{m: 0, color: theme.palette.secondary.main, letterSpacing: -1}}>
                    Siack에 오신 것을 환영합니다!
                </Typography>
                <Typography sx={{color: '#555', fontSize: 16, mt: 1.25, mb: 2.25}}>
                    워크스페이스를 선택하거나 새로 만들어 시작해보세요.
                </Typography>
            </Box>
            <Box sx={{p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                {!isLoggedIn ? (
                    <>
                        <Typography
                            sx={{color: '#888', fontSize: 18, mt: 6, mb: 2, fontWeight: 600, textAlign: 'center'}}>
                            워크스페이스를 사용하려면 회원가입 또는 로그인이 필요합니다.<br/>
                            회원가입 후 워크스페이스를 만들어보세요!
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{
                                borderRadius: 2,
                                py: 1.2,
                                px: 4,
                                fontSize: 16,
                                fontWeight: 600,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                mt: 2
                            }}
                            onClick={() => navigate('/join')}
                        >
                            회원가입 하러가기
                        </Button>
                    </>
                ) : loading ? (
                    <Typography sx={{color: '#888', mt: 4}}>불러오는 중...</Typography>
                ) : error ? (
                    <Typography color="error" sx={{mt: 4}}>{error}</Typography>
                ) : workspaces.length === 0 ? (
                    <>
                        <Typography sx={{color: '#888', fontSize: 18, mt: 6, mb: 2, fontWeight: 600}}>
                            아직 워크스페이스가 없습니다.<br/>새 워크스페이스를 만들어보세요!
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{
                                borderRadius: 2,
                                py: 1.2,
                                px: 4,
                                fontSize: 16,
                                fontWeight: 600,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                mt: 2
                            }}
                            onClick={handleCreateWorkspace}
                        >
                            새 워크스페이스 만들기
                        </Button>
                    </>
                ) : (
                    <>
                        {workspaces.map((workspace) => {
                            // 자신의 정보를 맨 앞에 오도록 정렬
                            const sortedUsers = [...(workspace.users || [])];
                            if (userData) {
                                sortedUsers.sort((a, b) => {
                                    if (a.id === userData.id) return -1;
                                    if (b.id === userData.id) return 1;
                                    return 0;
                                });
                            }

                            return (
                                <Paper key={workspace.workspaceId} elevation={1} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: '#fff',
                                    borderRadius: 3,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                    p: {xs: '20px 3vw', sm: '24px 5vw'},
                                    minWidth: 260,
                                    maxWidth: 420,
                                    width: '90vw',
                                    mb: 3,
                                    boxSizing: 'border-box',
                                }}>
                                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2}}>
                                        <Box sx={{fontSize: 36}}>💼</Box>
                                        {/* 삭제 버튼: ownerId가 본인일 때만 노출, 아이콘 아래에 작게 */}
                                        {userData && workspace.ownerId === userData.userid && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                sx={{
                                                    mt: 0.5,
                                                    fontSize: 11,
                                                    px: 1.2,
                                                    py: 0.2,
                                                    minWidth: 0,
                                                    borderRadius: 2,
                                                    borderColor: '#fbb',
                                                    color: '#d22',
                                                    lineHeight: 1,
                                                    fontWeight: 600,
                                                    opacity: 0.7
                                                }}
                                                onClick={() => openDeleteConfirm(workspace.workspaceId)}
                                            >
                                                삭제
                                            </Button>
                                        )}
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography fontWeight={600} fontSize={18} className="line-clamp-1">{workspace.name}</Typography>
                                        <Typography sx={{
                                            color: '#888',
                                            fontSize: 15,
                                            mt: 0.5
                                        }} className="line-clamp-2">{workspace.description}</Typography>
                                        <Box sx={{display: 'flex', alignItems: 'center', mt: 1}}>
                                            {sortedUsers.slice(0, 3).map((m, idx) => {
                                                const uniqueIdx = `${workspace.workspaceId}-${idx}`;
                                                // 닉네임 표시 핸들러
                                                const handleShow = () => setShowNicknameIdx(uniqueIdx);
                                                const handleHide = () => setShowNicknameIdx(null);
                                                // 모바일: 터치 시 토글
                                                const handleTouch = (e) => {
                                                    e.stopPropagation();
                                                    setShowNicknameIdx(showNicknameIdx === uniqueIdx ? null : uniqueIdx);
                                                };
                                                return (
                                                    <Box key={m.id} sx={{position: 'relative', display: 'inline-block'}}
                                                         onMouseEnter={!isMobile ? handleShow : undefined}
                                                         onMouseLeave={!isMobile ? handleHide : undefined}
                                                         onTouchStart={isMobile ? handleTouch : undefined}
                                                    >
                                                        {showNicknameIdx === uniqueIdx && (
                                                            <Box sx={{
                                                                position: 'absolute',
                                                                top: -36,
                                                                left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                bgcolor: '#222',
                                                                color: '#fff',
                                                                px: 1.5,
                                                                py: 0.5,
                                                                borderRadius: 1.5,
                                                                fontSize: 14,
                                                                fontWeight: 600,
                                                                whiteSpace: 'nowrap',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
                                                                zIndex: 99,
                                                                pointerEvents: 'none',
                                                            }}>
                                                                {m.nickname}
                                                            </Box>
                                                        )}
                                                        <Avatar
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                fontSize: 20,
                                                                bgcolor: '#eee',
                                                                border: '2px solid #fff',
                                                                ml: idx === 0 ? 0 : -1.2,
                                                                zIndex: 10 - idx,
                                                            }}
                                                            src={profileImages[m.id] && profileImages[m.id].trim() !== '' && profileImages[m.id] !== 'null' && profileImages[m.id] !== 'undefined' ? profileImages[m.id] : undefined}
                                                            alt={m.nickname || ''}
                                                        >
                                                            {(!profileImages[m.id] || profileImages[m.id] === 'null' || profileImages[m.id] === 'undefined' || profileImages[m.id] === '') && (m.nickname ? m.nickname[0] : '?')}
                                                        </Avatar>
                                                    </Box>
                                                );
                                            })}
                                            {sortedUsers.length > 3 && (
                                                <Typography sx={{ml: 2.5, fontSize: 15, color: '#888', zIndex: 0}}>
                                                    +{sortedUsers.length - 3}명
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    <ArrowForwardIosIcon sx={{fontSize: 24, color: '#bbb', ml: 2, cursor: 'pointer'}}
                                                         onClick={() => navigate(`/workspace/room/${workspace.workspaceId}`)}/>
                                </Paper>
                            );
                        })}
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{
                                borderRadius: 2,
                                py: 1.2,
                                px: 4,
                                fontSize: 16,
                                fontWeight: 600,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                mt: 2
                            }}
                            onClick={handleCreateWorkspace}
                        >
                            새 워크스페이스 만들기
                        </Button>
                    </>
                )}
            </Box>
            {/* 직접 구현한 삭제 확인 모달 */}
            {confirmModal.open && (
                <Box sx={{
                    position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 2000,
                    bgcolor: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Box sx={{
                        bgcolor: '#fff',
                        borderRadius: 3,
                        p: 4,
                        minWidth: 280,
                        maxWidth: 360,
                        boxShadow: 8,
                        textAlign: 'center'
                    }}>
                        <Typography fontWeight={700} fontSize={20} sx={{mb: 3, textAlign: 'left'}}>
                            워크스페이스 삭제
                        </Typography>
                        <Typography variant="h6" fontWeight={400} sx={{mb: 2, textAlign: 'left'}}>
                            워크스페이스를 삭제하시겠습니까?
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3}}>
                            <Button variant="outlined" color="inherit" fullWidth
                                    sx={{fontWeight: 600, fontSize: 16, py: 1.2}} onClick={handleDeleteCancel}>
                                취소
                            </Button>
                            <Button variant="contained" color="error" fullWidth
                                    sx={{fontWeight: 700, fontSize: 16, py: 1.2}} onClick={handleDeleteConfirmed}>
                                워크스페이스 삭제하기
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}
            {/* 직접 구현한 결과 모달 */}
            {resultModal.open && (
                <Box sx={{
                    position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 2000,
                    bgcolor: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Box sx={{
                        bgcolor: '#fff',
                        borderRadius: 3,
                        p: 4,
                        minWidth: 280,
                        maxWidth: 360,
                        boxShadow: 8,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h6" fontWeight={800} sx={{mb: 2}}>
                            {resultModal.title}
                        </Typography>
                        {resultModal.message && (
                            <Typography sx={{color: 'error.main', mb: 2}}>{resultModal.message}</Typography>
                        )}
                        <Button variant="contained" color="secondary" onClick={handleResultModalClose}>
                            닫기
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default Home;
