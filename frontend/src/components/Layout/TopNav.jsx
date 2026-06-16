export default function TopNav({ title, onMenuToggle }) {
  return (
    <header className="bg-surface border-b border-outline-variant flex justify-between items-center px-gutter py-4 z-10 sticky top-0">
      <div className="flex items-center">
        <button
          className="md:hidden mr-4 text-on-surface p-2 rounded hover:bg-surface-container-high transition-all"
          onClick={onMenuToggle}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-headline-md font-bold text-on-surface hidden md:block">
          {title}
        </h2>
      </div>
      <div className="flex items-center space-x-6">
        <button className="text-on-surface-variant hover:bg-surface-container-high transition-all p-2 rounded-full relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-label-md font-bold border border-outline-variant/50">
            AD
          </div>
          <span className="text-label-md text-on-surface font-medium hidden sm:block">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
