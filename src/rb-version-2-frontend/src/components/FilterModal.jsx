import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getGemFindScopeEl } from '../utils/gemfindScope';
import './FilterModal.css';

const FilterModal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    onApply, 
    onReset,
    showApplyButton = true,
    showResetButton = true,
    applyButtonText = "View Results",
    resetButtonText = "Reset"
}) => {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth <= 768;
    });

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const scope = getGemFindScopeEl();
        if (!scope) {
            return undefined;
        }
        if (isOpen) {
            scope.style.overflow = 'hidden';
        } else {
            scope.style.overflow = '';
        }
        
        return () => {
            scope.style.overflow = '';
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    // Mobile-only: do not render on desktop
    if (!isOpen || !isMobile) return null;

    // Convert title to a valid className (lowercase, replace spaces with hyphens)
    const filterClassName = title 
        ? title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : '';

    return (
        <div className="filter-modal-overlay" onClick={onClose}>
            <div className="filter-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="filter-modal-header">
                    {/* <div className="filter-modal-drag-handle"></div> */}
                    {showResetButton && (
                        <span className="filter-modal-reset-text" onClick={() => { onReset?.(); }}>
                            {resetButtonText}
                        </span>
                    )}
                    <h3 className="filter-modal-title">{title}</h3>
                    <button className="filter-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className={`filter-modal-content ${filterClassName}`}>
                    {children}
                </div>

                {/* Modal Footer */}
                <div className="filter-modal-footer">
                    {showApplyButton && (
                        <button className="filter-modal-apply-btn" onClick={onApply}>
                            {applyButtonText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterModal;

