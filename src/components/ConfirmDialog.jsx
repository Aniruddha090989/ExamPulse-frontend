import React from 'react';

export default function ConfirmDialog({
  show, title = 'Confirm deletion', message, confirmText = 'Delete',
  loading = false, onConfirm, onCancel,
}) {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1060 }} />
      <div className="modal fade show d-block" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" style={{ zIndex: 1065 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h5 className="modal-title" id="confirm-dialog-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onCancel} disabled={loading} />
            </div>
            <div className="modal-body">
              <div className="d-flex align-items-start gap-3">
                <div className="text-danger fs-4" aria-hidden="true"><i className="fa-solid fa-triangle-exclamation" /></div>
                <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{message}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Deleting...</> : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
