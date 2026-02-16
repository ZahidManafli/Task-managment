import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import TaskList from './components/tasks/TaskList';
import TaskGrid from './components/tasks/TaskGrid';
import TaskCreateModal from './components/tasks/TaskCreateModal';
import TaskDetailModal from './components/tasks/TaskDetailModal';
import NotesList from './components/notes/NotesList';
import NoteCreateModal from './components/notes/NoteCreateModal';
import DocumentsList from './components/documents/DocumentsList';
import { TASK_STATUSES } from './utils/constants';
// Firebase imports
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './services/firebase';
// Supabase imports for file storage
import { uploadFile, deleteFile, STORAGE_BUCKETS } from './services/supabase';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const { currentUser } = useAuth();

  // Load tasks from Firebase (all users can see all tasks)
  useEffect(() => {
    if (!currentUser) return;

    const tasksQuery = query(collection(db, 'tasks'));
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
    }, (error) => {
      console.error('Error loading tasks:', error);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  // Load notes from Firebase (all users can see all notes)
  useEffect(() => {
    if (!currentUser) return;

    const notesQuery = query(collection(db, 'notes'));
    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesData);
    }, (error) => {
      console.error('Error loading notes:', error);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  // Load documents from Firebase (all users can see all documents)
  useEffect(() => {
    if (!currentUser) return;

    const docsQuery = query(collection(db, 'documents'));
    const unsubscribe = onSnapshot(docsQuery, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docsData);
    }, (error) => {
      console.error('Error loading documents:', error);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  const handleCreateTask = async (taskData) => {
    try {
      // Upload images to Supabase Storage first
      const imageUrls = [];
      for (const img of taskData.attachments || []) {
        if (img.file) {
          const filePath = `${currentUser.uid}/${Date.now()}_${img.name}`;
          const result = await uploadFile(STORAGE_BUCKETS.TASK_IMAGES, img.file, filePath);
          if (result.success) {
            imageUrls.push({ url: result.url, path: result.path, name: img.name });
          } else {
            console.error('Error uploading image:', result.error);
          }
        } else {
          // Existing image (already uploaded)
          imageUrls.push(img);
        }
      }

      // Save to Firebase Firestore
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        attachments: imageUrls,
        status: 'To Do',
        comments: [],
        createdAt: new Date(),
        createdBy: currentUser.email,
      });
      
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      // Handle new image uploads if any
      const existingImages = updatedTask.attachments?.filter(img => !img.file) || [];
      const newImages = updatedTask.attachments?.filter(img => img.file) || [];
      const uploadedImages = [];

      // Upload new images to Supabase
      for (const img of newImages) {
        const filePath = `${currentUser.uid}/${Date.now()}_${img.name}`;
        const result = await uploadFile(STORAGE_BUCKETS.TASK_IMAGES, img.file, filePath);
        if (result.success) {
          uploadedImages.push({ url: result.url, path: result.path, name: img.name });
        }
      }

      const finalAttachments = [...existingImages, ...uploadedImages];
      const taskWithAttachments = { ...updatedTask, attachments: finalAttachments };

      // Update in Firebase Firestore
      const taskRef = doc(db, 'tasks', updatedTask.id);
      await updateDoc(taskRef, taskWithAttachments);
      
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      
      // Delete images from Supabase Storage
      if (task.attachments) {
        for (const img of task.attachments) {
          if (img.path) {
            await deleteFile(STORAGE_BUCKETS.TASK_IMAGES, img.path);
          }
        }
      }

      // Delete from Firebase Firestore
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSetStatus = (task) => {
    setSelectedTask(task);
  };

  const handleSeeDetails = (task) => {
    setSelectedTask(task);
  };

  const handleSetUser = (task) => {
    setSelectedTask(task);
  };

  const handleAddCommentary = (task) => {
    setSelectedTask(task);
  };

  const handleCreateNote = async (noteData) => {
    try {
      await addDoc(collection(db, 'notes'), {
        ...noteData,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setShowNoteForm(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      const noteRef = doc(db, 'notes', editingNote.id);
      await updateDoc(noteRef, {
        ...noteData,
        updatedAt: new Date(),
      });
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    try {
      for (const file of files) {
        // Upload file to Supabase Storage
        const filePath = `${currentUser.uid}/${Date.now()}_${file.name}`;
        const result = await uploadFile(STORAGE_BUCKETS.DOCUMENTS, file, filePath);
        
        if (result.success) {
          // Save to Firebase Firestore
          await addDoc(collection(db, 'documents'), {
            name: file.name,
            url: result.url,
            path: result.path,
            size: file.size,
            type: file.type,
            uploadedAt: Timestamp.now(),
            userId: currentUser.uid,
          });
        } else {
          console.error('Error uploading document to Supabase:', result.error);
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleDownloadDocument = (document) => {
    // TODO: Implement download logic
    window.open(document.url, '_blank');
  };

  const handleDeleteDocument = async (docId) => {
    try {
      const doc = documents.find(d => d.id === docId);
      
      // Delete file from Supabase Storage
      if (doc.path) {
        const result = await deleteFile(STORAGE_BUCKETS.DOCUMENTS, doc.path);
        if (!result.success) {
          console.error('Error deleting file from storage:', result.error);
        }
      }

      // Delete from Firebase Firestore
      await deleteDoc(doc(db, 'documents', docId));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <div className="flex items-center space-x-4">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  List
                </button>
              </div>
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + Create Task
              </button>
            </div>
          </div>

          {showTaskForm && (
            <TaskCreateModal
              onSubmit={handleCreateTask}
              onClose={() => setShowTaskForm(false)}
            />
          )}

          {viewMode === 'grid' ? (
            <TaskGrid
              tasks={tasks}
              onSetStatus={handleSetStatus}
              onSeeDetails={handleSeeDetails}
              onSetUser={handleSetUser}
              onAddCommentary={handleAddCommentary}
            />
          ) : (
            <TaskList
              tasks={tasks}
              onSetStatus={handleSetStatus}
              onSeeDetails={handleSeeDetails}
              onSetUser={handleSetUser}
              onAddCommentary={handleAddCommentary}
            />
          )}

          {selectedTask && (
            <TaskDetailModal
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
            <button
              onClick={() => {
                setEditingNote(null);
                setShowNoteForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Create Note
            </button>
          </div>

          {showNoteForm && (
            <NoteCreateModal
              onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
              onClose={() => {
                setShowNoteForm(false);
                setEditingNote(null);
              }}
              initialData={editingNote}
            />
          )}

          <NotesList
            notes={notes}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
          />
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
            <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              + Upload Document
            </label>
          </div>

          

          <DocumentsList
            documents={documents}
            onDownload={handleDownloadDocument}
            onDelete={handleDeleteDocument}
          />
        </div>
      )}
    </Layout>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
