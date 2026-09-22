import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  destructive?: boolean;
  // Aliases for compatibility
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  destructive = false,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDanger
}) => {
  const isDestructive = destructive || isDanger || false;
  const [typedConfirmation, setTypedConfirmation] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedConfirmation('');
    }
  }, [isOpen]);

  const isConfirmed = isDestructive ? typedConfirmation.trim().toUpperCase() === 'CONFIRMAR' : true;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            className={isDestructive ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={handleConfirm}
            disabled={!isConfirmed}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {isDestructive && (
            <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 shrink-0">
              <AlertTriangle size={22} />
            </div>
          )}
          <p className="text-sm text-[var(--color-text)] leading-relaxed">{message}</p>
        </div>

        {isDestructive && (
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2 text-xs">
            <p className="font-semibold text-rose-600 dark:text-rose-400">
              Esta é uma ação irreversível. Digite <b>CONFIRMAR</b> abaixo para prosseguir:
            </p>
            <input
              type="text"
              className="form-control text-xs uppercase font-mono tracking-wider"
              placeholder="Digite CONFIRMAR"
              value={typedConfirmation}
              onChange={e => setTypedConfirmation(e.target.value)}
              autoFocus
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
