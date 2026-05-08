import React, { useState } from 'react';

/**
 * LearningPrompt Component
 * Subcomponent for displaying learning form when AI has no answer
 * Allows admin to provide an answer that gets saved to knowledge base
 */
const LearningPrompt = ({
  question,
  onSave,
  onCancel,
  loading,
  isDuplicate,
  onConfirmDuplicate,
}) => {
  const [answer, setAnswer] = useState('');
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = () => {
    if (!answer.trim()) {
      setError('Please provide an answer');
      return;
    }

    if (isDuplicate && !showDuplicateConfirm) {
      setShowDuplicateConfirm(true);
      return;
    }

    setError(null);
    onSave(answer);
  };

  const handleConfirmDuplicate = () => {
    onConfirmDuplicate();
    setShowDuplicateConfirm(false);
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
      {/* Prompt Message */}
      <div className="text-sm text-gray-800">
        <p className="font-semibold mb-1">📚 I'm Learning!</p>
        <p className="text-xs text-gray-700">
          I don't have an answer for "<span className="font-medium italic">{question}</span>" yet. 
          How should I respond to this next time?
        </p>
      </div>

      {/* Duplicate Warning */}
      {isDuplicate && !showDuplicateConfirm && (
        <div className="text-xs p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
          <span className="font-semibold">⚠️ Similar answer exists:</span> "{isDuplicate.question}"
          <br />
          <span className="text-xs text-amber-700">You can still save to add alternative answers.</span>
        </div>
      )}

      {/* Duplicate Confirmation */}
      {showDuplicateConfirm && (
        <div className="text-xs p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
          <p className="font-semibold mb-1">⚠️ Confirm: Save similar answer?</p>
          <p className="text-amber-700 mb-2">This is similar to an existing answer. Save anyway?</p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmDuplicate}
              className="px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 transition-colors"
              disabled={loading}
            >
              Yes, Save
            </button>
            <button
              onClick={() => setShowDuplicateConfirm(false)}
              className="px-2 py-1 bg-gray-300 text-gray-800 text-xs rounded hover:bg-gray-400 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-xs p-2 bg-red-50 border border-red-200 rounded text-red-800">
          {error}
        </div>
      )}

      {/* Answer Textarea */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">
          Your Answer:
        </label>
        <textarea
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setError(null);
          }}
          placeholder="Type the correct answer... (e.g., Press OK → Phone → Call Features → Account 1 → Fwd Disable)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
          disabled={loading}
        />
        <span className="text-xs text-gray-500 text-right">
          {answer.length} / 500 characters
        </span>
      </div>

      {/* Action Buttons */}
      {!showDuplicateConfirm && (
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-2 bg-gray-300 text-gray-800 text-xs font-medium rounded hover:bg-gray-400 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !answer.trim()}
            className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {loading ? (
              <>
                <svg
                  className="w-3 h-3 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save to Knowledge
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LearningPrompt;
