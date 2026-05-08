/**
 * TypingAnimation Component
 * Shows loading indicator while AI is searching for answer
 * Animated dots effect
 */
export const TypingAnimation = () => {
  return (
    <div className="flex items-center gap-1 py-3 px-4">
      <div className="flex gap-1">
        <div
          className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
          style={{ animationDelay: '0s' }}
        ></div>
        <div
          className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
          style={{ animationDelay: '0.1s' }}
        ></div>
        <div
          className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
          style={{ animationDelay: '0.2s' }}
        ></div>
      </div>
      <span className="text-xs text-gray-500 ml-2">AI is thinking...</span>
    </div>
  );
};

export default TypingAnimation;
