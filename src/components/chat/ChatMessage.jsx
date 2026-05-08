/**
 * ChatMessage Component
 * Displays a single chat message (user or assistant)
 * Two variants: user (right-aligned, blue) and assistant (left-aligned, gray)
 */
export const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const dateValue = timestamp?.toDate?.() || timestamp;
    const parsedDate = dateValue instanceof Date ? dateValue : new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        {message.timestamp && (
          <p
            className={`text-xs mt-1 ${
              isUser ? 'text-blue-200' : 'text-gray-500'
            }`}
          >
            {formatTimestamp(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
