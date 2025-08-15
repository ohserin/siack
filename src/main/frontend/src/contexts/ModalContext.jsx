import { createContext, useContext, useState, useCallback } from "react";
import GlobalModal from "../components/GlobalModal.jsx";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: ""
    });

    const showModal = useCallback((title, message) => {
        setModal({ open: true, title, message });
    }, []);

    const closeModal = useCallback(() => {
        setModal(prev => ({ ...prev, open: false }));
    }, []);

    return (
        <ModalContext.Provider value={{ modal: modal, showModal, closeModal }}>
            {children}
            <GlobalModal />
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);
