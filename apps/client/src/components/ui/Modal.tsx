import type { ReactNode } from 'react';

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

function Modal({ title, onClose, children, footer }: ModalProps) {
  return (
    <div className='modal-backdrop' onClick={onClose}>
      <div className='modal' onClick={(event) => event.stopPropagation()} role='dialog'>
        <header className='modal__header'>
          <h2 className='modal__title'>{title}</h2>

          <button className='modal__close' type='button' onClick={onClose} aria-label='Закрыть'>
            ×
          </button>
        </header>

        <div className='modal__body'>{children}</div>

        {footer && <footer className='modal__footer'>{footer}</footer>}
      </div>
    </div>
  );
}

export default Modal;
