import { useState } from 'react';

/**
 * FloatingButton Component
 * Persistent chat widget button on all pages
 * Fixed position bottom-right corner
 * Opens/closes chat modal
 */
export const FloatingButton = ({ onClick, hasUnread = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-6 right-6 rounded-full shadow-lg transition-all duration-300 ease-in-out z-40 ${
        isHovered
          ? 'scale-110 shadow-2xl'
          : 'scale-100 shadow-lg'
      } hidden sm:flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white`}
      title="Open AI Support Assistant"
      aria-label="AI Support Chat"
    >
      {/* Chat icon SVG */}
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"></path>
        <path d="M15 7H5"></path>
        <path d="M15 11H5"></path>
      </svg>

      {/* Unread badge */}
      {hasUnread && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
          •
        </span>
      )}

      {/* Tooltip */}
      {isHovered && (
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 text-sm text-white bg-gray-800 rounded shadow-lg whitespace-nowrap">
          AI Support
        </span>
      )}
    </button>
  );
};

export default FloatingButton;
