import { Modal, Typography, Box, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useModal } from "../contexts/ModalContext.jsx";

export default function GlobalModal() {
    const { modal, closeModal } = useModal();

    if (!modal) return null;

    return (
        <Modal
            open={modal.open}
            onClose={(event, reason) => {
                if (reason === 'backdropClick') return; // 외부 클릭 방지
                closeModal();
            }}
            BackdropProps={{ style: { backgroundColor: 'rgba(0,0,0,0.2)' } }}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Box
                sx={{
                    p: 5,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: 24,
                    width: { xs: '90%', sm: 400 },
                    maxWidth: 500,
                    position: 'relative',
                    animation: 'fadeIn 0.3s ease-out',
                }}
            >
                {/* X 버튼 */}
                <IconButton
                    onClick={closeModal}
                    sx={{ position: 'absolute', top: 8, right: 8, color: 'grey.600' }}
                >
                    <CloseIcon />
                </IconButton>

                {/* 타이틀과 내용 왼쪽 정렬 */}
                <Typography variant="h6" fontWeight={600} mb={2} sx={{ textAlign: 'left' }}>
                    {modal.title}
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'left' }}>
                    {modal.message}
                </Typography>
            </Box>
        </Modal>
    );
}
