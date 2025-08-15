// components/GlobalModal.jsx
import { Modal, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function GlobalModal({ open, title, message, onClose }) {
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                p: 4,
                borderRadius: 2,
                boxShadow: 24,
                minWidth: 300,
            }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "grey.500",
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
                <Typography>{message}</Typography>
            </Box>
        </Modal>
    );
}
