import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { searchAnswer } from '../services/aiSearch';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing AI chat functionality
 * Handles message state, Firestore sync, and search logic
 */
export const useAiChat = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const sortMessagesByTimestamp = (items) =>
    items.sort((left, right) => {
      const leftTime = left.timestamp?.toMillis?.() ?? left.timestamp ?? 0;
      const rightTime = right.timestamp?.toMillis?.() ?? right.timestamp ?? 0;

      return leftTime - rightTime;
    });

  // Load or create conversation for current user
  useEffect(() => {
    if (!currentUser) {
      setMessages([]);
      setConversationId(null);
      return;
    }

    // Query for existing conversation
    const q = query(
      collection(db, 'chat_conversations'),
      where('userId', '==', currentUser.uid)
    );

    let messagesUnsubscribe = null;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      (async () => {
        if (!snapshot.empty) {
          // Use the first (and should be only) conversation
          const conversationDoc = snapshot.docs[0];
          const convId = conversationDoc.id;
          setConversationId(convId);

          // Unsubscribe previous messages listener if any
          if (messagesUnsubscribe) {
            messagesUnsubscribe();
            messagesUnsubscribe = null;
          }

          // Listen to messages for this conversation in real-time
          const messagesQuery = query(
            collection(db, 'chat_messages'),
            where('conversationId', '==', convId)
          );

          messagesUnsubscribe = onSnapshot(messagesQuery, (msgSnapshot) => {
            const loadedMessages = sortMessagesByTimestamp(
              msgSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
            );
            setMessages(loadedMessages);
          });
        } else {
          // No conversation yet, will be created on first message
          setConversationId(null);
          setMessages([]);
          if (messagesUnsubscribe) {
            messagesUnsubscribe();
            messagesUnsubscribe = null;
          }
        }
      })();
    });

    return () => {
      unsubscribe();
      if (messagesUnsubscribe) messagesUnsubscribe();
    };
  }, [currentUser]);

  /**
   * Create a new conversation if it doesn't exist
   */
  const createConversation = useCallback(async () => {
    if (!currentUser || conversationId) return conversationId;

    try {
      const docRef = await addDoc(collection(db, 'chat_conversations'), {
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setConversationId(docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create conversation');
      return null;
    }
  }, [currentUser, conversationId]);

  /**
   * Send a user message and get AI response
   */
  const sendMessage = useCallback(
    async (userMessage) => {
      if (!userMessage.trim() || !currentUser) return;

      setLoading(true);
      setError(null);

      try {
        // Create conversation if needed
        let convId = conversationId;
        if (!convId) {
          convId = await createConversation();
          if (!convId) {
            setLoading(false);
            return;
          }
        }

        // Create user message
        const userMsg = {
          role: 'user',
          content: userMessage,
          timestamp: serverTimestamp(),
        };

        // Add user message to Firestore
        await addDoc(collection(db, 'chat_messages'), {
          conversationId: convId,
          userId: currentUser.uid,
          ...userMsg,
        });

        // Search for answer using AI search
        const searchResult = await searchAnswer(userMessage);

        // Create assistant response
        const assistantMsg = {
          role: 'assistant',
          content: searchResult
            ? searchResult.answer
            : 'No related solution found.',
          timestamp: serverTimestamp(),
          metadata: searchResult
            ? {
                question: searchResult.question,
                score: searchResult.score,
                knowledgeId: searchResult.id,
              }
            : null,
        };

        // Add assistant message to Firestore
        await addDoc(collection(db, 'chat_messages'), {
          conversationId: convId,
          userId: currentUser.uid,
          ...assistantMsg,
        });
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message');
      } finally {
        setLoading(false);
      }
    },
    [conversationId, currentUser, createConversation]
  );

  /**
   * Clear chat history
   */
  const clearHistory = useCallback(async () => {
    try {
      setMessages([]);
      // In production, delete the conversation from Firestore
      // await deleteDoc(doc(db, 'chat_conversations', conversationId));
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Failed to clear history');
    }
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory,
    conversationId,
  };
};

export default useAiChat;
