import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-sm">
      <div className="text-center -mt-2">
        <div className={`w-12 h-12 rounded-full ${type === 'danger' ? 'bg-amber-100' : 'bg-primary/10'} flex items-center justify-center mx-auto mb-4`}>
          <span className={`material-symbols-outlined filled text-2xl ${type === 'danger' ? 'text-amber-600' : 'text-primary'}`}>
            warning
          </span>
        </div>
        <h3 className="text-headline-md font-semibold text-on-surface mb-2">{title}</h3>
        <p className="text-body-md text-on-surface-variant mb-6">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            className="px-4 py-2 rounded-lg text-label-md bg-white border border-outline-variant text-on-surface-variant hover:bg-slate-50 transition-colors flex-1"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-label-md text-white transition-colors shadow-sm flex-1 ${
              type === 'danger' ? 'bg-error hover:bg-on-error-container' : 'bg-primary hover:bg-primary-container'
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
