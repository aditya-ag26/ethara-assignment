export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface">
      <p className="text-sm text-on-surface-variant">
        Showing <span className="font-medium text-on-surface">{startItem}</span> to{' '}
        <span className="font-medium text-on-surface">{endItem}</span> of{' '}
        <span className="font-medium text-on-surface">{totalItems}</span> entries
      </p>
      <div className="flex items-center gap-1">
        <button
          className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        </button>
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-on-surface-variant text-sm">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-primary text-white shadow-sm'
                  : 'border border-outline-variant text-on-surface hover:bg-surface-container-low'
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}
        <button
          className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
