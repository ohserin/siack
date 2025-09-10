import { Modal, Typography, Box, IconButton, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useModal } from "../contexts/ModalContext.jsx";

export default function GlobalModal() {
    const { modal, closeModal } = useModal();

    if (!modal) return null;

    return (
        <Modal
            open={modal.open}
            onClose={(event, reason) => {
                if (reason === 'backdropClick') return;
                closeModal(false);
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
                <IconButton
                    onClick={() => closeModal(false)}
                    sx={{ position: 'absolute', top: 8, right: 8, color: 'grey.600' }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={600} mb={2} sx={{ textAlign: 'left' }}>
                    {modal.title}
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'left', mb: 3 }}>
                    {modal.message}
                </Typography>
                {/* 확인/취소 버튼 */}
                {modal.confirm ? (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" color="inherit" onClick={() => closeModal(false)}>
                            취소
                        </Button>
                        <Button variant="contained" color="primary" onClick={() => closeModal(true)}>
                            확인
                        </Button>
                    </Box>
                ) : null}
            </Box>
        </Modal>
    );
}
