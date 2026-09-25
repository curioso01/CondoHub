// CONDOHUB — COMPONENTE CONFIRM DIALOG
// Construído sobre Modal.tsx

import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';

// ─── TIPOS ────────────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Se true: usuário deve digitar "CONFIRMAR" para habilitar o botão */
  destructive?: boolean;
}

const CONFIRM_WORD = 'CONFIRMAR';

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  destructive = false,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const isConfirmEnabled = destructive ? inputValue.trim() === CONFIRM_WORD : true;

  // Limpar input ao abrir/fechar
  useEffect(() => {
    if (!isOpen) setInputValue('');
  }, [isOpen]);

  const handleConfirm = () => {
    if (!isConfirmEnabled) return;
    onConfirm();
    onClose();
  };

  const defaultConfirmLabel = confirmLabel ?? (destructive ? 'Excluir Definitivamente' : 'Confirmar');

  // ── FOOTER ──────────────────────────────────────────────────────────────────
  const footer = (
    <>
      <button
        className="btn btn-outline"
        onClick={onClose}
      >
        {cancelLabel}
      </button>
      <button
        className={`btn ${destructive ? 'btn-danger' : 'btn-primary'}`}
        onClick={handleConfirm}
        disabled={!isConfirmEnabled}
        style={{
          opacity: isConfirmEnabled ? 1 : 0.5,
          cursor: isConfirmEnabled ? 'pointer' : 'not-allowed',
        }}
      >
        {destructive && <Trash2 size={15} />}
        {defaultConfirmLabel}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Ícone + Mensagem */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: destructive ? '#FDE8E8' : '#E1EFFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: destructive ? 'var(--color-danger)' : 'var(--color-primary)',
            }}
          >
            <AlertTriangle size={18} />
          </div>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text)',
              lineHeight: '1.6',
              margin: 0,
              paddingTop: '6px',
            }}
          >
            {message}
          </p>
        </div>

        {/* Campo de confirmação (apenas para ações destrutivas) */}
        {destructive && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
              Esta ação é irreversível. Digite <strong>{CONFIRM_WORD}</strong> para prosseguir:
            </label>
            <input
              type="text"
              className="form-control"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              autoFocus
              style={{
                borderColor: inputValue && !isConfirmEnabled
                  ? 'var(--color-danger)'
                  : inputValue === CONFIRM_WORD
                  ? 'var(--color-secondary)'
                  : undefined,
              }}
            />
            {inputValue.length > 0 && !isConfirmEnabled && (
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--color-danger)',
                  marginTop: '4px',
                }}
              >
                Digite exatamente "{CONFIRM_WORD}" para continuar.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
