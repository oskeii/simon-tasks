import React, { useState } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
            {/* Backdrop */}
            <div className='absolute inset-0 bg-black/50 transition-opacity duration-500'
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className='relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-y-auto'>
                {children}
            </div>
        </div>
    );
};

export default Modal;