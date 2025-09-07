import React from "react";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
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
            <span style={{ display: 'flex', alignItems: 'center' }}>
                <BuildRoundedIcon style={{ marginRight: 8, color: theme.palette.secondary.main }} />
                개발중
            </span>,
            "준비중인 기능입니다."
        );
    };

    return (
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", background: "#f8f9fa" }}>
            {/* 안내 문구 추가 */}
            <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "32px 0 0 0", textAlign: "center" }}>
                <h2 style={{ fontWeight: 800, fontSize: 28, margin: 0, color: theme.palette.secondary.main, letterSpacing: -1 }}>Siack에 오신 것을 환영합니다!</h2>
                <div style={{ color: "#555", fontSize: 16, marginTop: 10, marginBottom: 18 }}>
                    워크스페이스를 선택하거나 새로 만들어 시작해보세요.
                </div>
            </div>
            <div style={{ padding: 0, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                {workspaces.map((workspace) => (
                    <div key={workspace.name} style={{
                        display: "flex",
                        alignItems: "center",
                        background: "#fff",
                        borderRadius: 12,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                        padding: "24px 5vw",
                        minWidth: 260,
                        maxWidth: 420,
                        width: "90vw",
                        marginBottom: 24,
                        boxSizing: "border-box",
                    }}>
                        <span style={{ fontSize: 36, marginRight: 16 }}>{workspace.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 22 }}>{workspace.name}</div>
                            <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
                                {workspace.members.slice(0, 3).map((m, idx) => (
                                    <span key={m.id} style={{
                                        width: 32, height: 32, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginLeft: idx === 0 ? 0 : -10, border: "2px solid #fff"
                                    }}>{m.avatar}</span>
                                ))}
                                {workspace.members.length > 3 && (
                                    <span style={{ marginLeft: 8, fontSize: 15, color: "#888" }}>+{workspace.members.length - 3}명</span>
                                )}
                            </div>
                        </div>
                        <ArrowForwardIosIcon style={{ fontSize: 24, color: "#bbb", marginLeft: 16, cursor: 'pointer' }} onClick={handleDevModal} />
                    </div>
                ))}
                <button style={{
                    background: theme.palette.secondary.main,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "14px 32px",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    marginTop: 16
                }}
                onClick={handleDevModal}
                >
                    새 워크스페이스 만들기
                </button>
            </div>
        </main>
    );
}

export default Home;