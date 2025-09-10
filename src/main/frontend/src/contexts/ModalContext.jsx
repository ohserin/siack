import { createContext, useContext, useState, useCallback } from "react";
import GlobalModal from "../components/GlobalModal.jsx";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        confirm: false,
        resolve: null
    });

    // confirm 모드 지원: Promise 반환
    const showModal = useCallback((title, message, options = {}) => {
        if (options.confirm) {
            return new Promise((resolve) => {
                setModal({ open: true, title, message, confirm: true, resolve });
            });
        } else {
            setModal({ open: true, title, message, confirm: false, resolve: null });
        }
    }, []);

    // 확인/취소/닫기 시 호출
    const closeModal = useCallback((result = false) => {
        setModal(prev => {
            if (prev.confirm && typeof prev.resolve === 'function') {
                prev.resolve(result);
            }
            return { ...prev, open: false, resolve: null };
        });
    }, []);

    return (
        <ModalContext.Provider value={{ modal, showModal, closeModal }}>
            {children}
            <GlobalModal />
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);
