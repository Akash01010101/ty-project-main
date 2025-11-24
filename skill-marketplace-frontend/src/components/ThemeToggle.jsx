import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 sm:p-3 rounded-full transition-all duration-300 ease-in-out hover:scale-110 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
      style={{
        backgroundColor: 'var(--button-secondary)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-accent)'
      }}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDarkMode ? (
          <Sun size={20} className="text-current transition-transform duration-300 rotate-0 hover:rotate-12" />
        ) : (
          <Moon size={20} className="text-current transition-transform duration-300 rotate-0 hover:-rotate-12" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;