import React, { createContext, useContext, useState, useCallback } from 'react';
import { Document, Category } from '@shared/types';

type ModalType = 'login' | 'edit-doc' | 'edit-category' | null;

interface ModalState {
    type: ModalType;
    data?: any;
    context?: any;
}

interface ModalContextType {
    modal: ModalState;
    openModal: (type: ModalType, data?: any, context?: any) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [modal, setModal] = useState<ModalState>({ type: null });

    const openModal = useCallback((type: ModalType, data?: any, context?: any) => {
        setModal({ type, data, context });
    }, []);

    const closeModal = useCallback(() => {
        setModal({ type: null });
    }, []);

    return (
        <ModalContext.Provider value={{ modal, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within ModalProvider');
    return context;
};
