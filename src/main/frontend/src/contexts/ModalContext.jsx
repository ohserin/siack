import { createContext, useContext, useState, useCallback } from "react";
import GlobalModal from "../components/GlobalModal.jsx";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        open: false,
        title: "",
        message: ""
    });

    const showModal = useCallback((title, message) => {
        setModalState({ open: true, title, message });
    }, []);

    const hideModal = useCallback(() => {
        setModalState((prev) => ({ ...prev, open: false }));
    }, []);

    return (
        <ModalContext.Provider value={{ showModal, hideModal }}>
            {children}
            <GlobalModal
                open={modalState.open}
                title={modalState.title}
                message={modalState.message}
                onClose={hideModal}
            />
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);
