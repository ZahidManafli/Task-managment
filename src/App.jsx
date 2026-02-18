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
import StockList from './components/stock/StockList';
import StockTypeForm from './components/stock/StockTypeForm';
import StockItemForm from './components/stock/StockItemForm';
import StockDetailModal from './components/stock/StockDetailModal';
import { TASK_STATUSES } from './utils/constants';
// Firebase imports
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './services/firebase';
// Supabase imports for file storage
import { uploadFile, deleteFile, STORAGE_BUCKETS } from './services/supabase';
// Email service
import { sendTaskAssignmentEmail, sendStatusChangeEmail } from './services/emailService';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stockTypes, setStockTypes] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [selectedStockTypeId, setSelectedStockTypeId] = useState('all');
  const [selectedStockAvailability, setSelectedStockAvailability] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [stockViewMode, setStockViewMode] = useState('grid');
  const [stockSearch, setStockSearch] = useState('');
  const [documentSearch, setDocumentSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [taskViewFilter, setTaskViewFilter] = useState('assigned');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showStockTypeForm, setShowStockTypeForm] = useState(false);
  const [showStockItemForm, setShowStockItemForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [showTypesManagement, setShowTypesManagement] = useState(false);
  const [editingStockType, setEditingStockType] = useState(null);
  const { currentUser, isAdmin } = useAuth();

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

  // Load users from Firebase (used for assigning tasks)
  useEffect(() => {
    if (!currentUser) return;

    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData = snapshot.docs.map((d) => {
          const data = d.data() || {};
          return {
            id: d.id,
            ...data,
            email: data.email || d.id,
          };
        });

        usersData.sort((a, b) =>
          (a.name || a.email || '').localeCompare(b.name || b.email || '')
        );

        setUsers(usersData);
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Load stock types from Firebase (all users can see all types)
  useEffect(() => {
    if (!currentUser) return;

    const typesQuery = query(collection(db, 'stockTypes'));
    const unsubscribe = onSnapshot(
      typesQuery,
      (snapshot) => {
        const typesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStockTypes(typesData);
      },
      (error) => {
        console.error('Error loading stock types:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Load stock items from Firebase (all users can see all items)
  useEffect(() => {
    if (!currentUser) return;

    const itemsQuery = query(collection(db, 'stockItems'));
    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const itemsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStockItems(itemsData);
      },
      (error) => {
        console.error('Error loading stock items:', error);
      }
    );
    
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
      const taskDoc = {
        ...taskData,
        attachments: imageUrls,
        status: 'To Do',
        comments: [],
        createdAt: new Date(),
        createdBy: currentUser.email,
      };
      
      await addDoc(collection(db, 'tasks'), taskDoc);
      
      // Send email to assigned user if task is assigned
      if (taskData.assignedTo && taskData.assignedTo.trim() !== '') {
        try {
          await sendTaskAssignmentEmail(taskDoc, taskData.assignedTo);
        } catch (error) {
          console.error('Failed to send assignment email:', error);
          // Don't block task creation if email fails
        }
      }
      
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

      // Get previous task state to detect changes
      const previousTask = tasks.find(t => t.id === updatedTask.id);
      const statusChanged = previousTask?.status !== taskWithAttachments.status;
      const assignmentChanged = previousTask?.assignedTo !== taskWithAttachments.assignedTo;

      // Update in Firebase Firestore
      const taskRef = doc(db, 'tasks', updatedTask.id);
      await updateDoc(taskRef, taskWithAttachments);
      
      // Send email notifications
      try {
        // Only send email for STATUS change
        if (statusChanged && previousTask) {
          await sendStatusChangeEmail(
            { ...previousTask, ...taskWithAttachments },
            taskWithAttachments.status,
            currentUser.email
          );
        }
        // Note: edits/comments/assignment changes do NOT send emails (template limit)
      } catch (error) {
        console.error('Failed to send update email:', error);
        // Don't block task update if email fails
      }
      
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

  const handleCreateStockType = async (typeData) => {
    try {
      if (editingStockType) {
        // Update existing type
        const typeRef = doc(db, 'stockTypes', editingStockType.id);
        await updateDoc(typeRef, {
          ...typeData,
          updatedAt: new Date(),
        });
        setEditingStockType(null);
      } else {
        // Create new type
        await addDoc(collection(db, 'stockTypes'), {
          ...typeData,
          createdAt: new Date(),
          createdBy: currentUser.email,
        });
      }
      setShowStockTypeForm(false);
    } catch (error) {
      console.error('Error creating/updating stock type:', error);
    }
  };

  const handleCreateStockItem = async (itemData) => {
    try {
      const selectedType = stockTypes.find((t) => t.id === itemData.typeId) || null;

      await addDoc(collection(db, 'stockItems'), {
        ...itemData,
        typeName: selectedType ? selectedType.name : '',
        createdAt: new Date(),
        createdBy: currentUser.email,
      });
      setShowStockItemForm(false);
    } catch (error) {
      console.error('Error creating stock item:', error);
    }
  };

  const handleChangeStockQuantity = async (itemId, delta) => {
    try {
      const item = stockItems.find((i) => i.id === itemId);
      if (!item) return;

      const currentQty = Number(item.quantity) || 0;
      const newQty = Math.max(0, currentQty + delta);

      const itemRef = doc(db, 'stockItems', itemId);
      await updateDoc(itemRef, { quantity: newQty });
    } catch (error) {
      console.error('Error updating stock quantity:', error);
    }
  };

  const handleSelectStockItem = (item) => {
    setSelectedStockItem(item);
  };

  const handleUpdateStockItem = async (updatedItem) => {
    try {
      const selectedType = stockTypes.find((t) => t.id === updatedItem.typeId) || null;
      const itemRef = doc(db, 'stockItems', updatedItem.id);

      const { id, ...rest } = updatedItem;
      await updateDoc(itemRef, {
        ...rest,
        typeName: selectedType ? selectedType.name : '',
      });

      setSelectedStockItem(null);
    } catch (error) {
      console.error('Error updating stock item:', error);
    }
  };

  const handleDeleteStockItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'stockItems', itemId));
      setSelectedStockItem(null);
    } catch (error) {
      console.error('Error deleting stock item:', error);
    }
  };

  const handleUpdateStockType = async (typeId, updatedData) => {
    try {
      const typeRef = doc(db, 'stockTypes', typeId);
      await updateDoc(typeRef, updatedData);
    } catch (error) {
      console.error('Error updating stock type:', error);
    }
  };

  const handleDeleteStockType = async (typeId) => {
    try {
      await deleteDoc(doc(db, 'stockTypes', typeId));
    } catch (error) {
      console.error('Error deleting stock type:', error);
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 text-sm ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
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

          {/* Task view sub-tabs: Assigned / Sent */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setTaskViewFilter('assigned')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                  taskViewFilter === 'assigned'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Assigned
              </button>
              <button
                onClick={() => setTaskViewFilter('sent')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                  taskViewFilter === 'sent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sent
              </button>
            </nav>
          </div>

          {/* Status filter chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTaskStatusFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border ${
                taskStatusFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {TASK_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setTaskStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border ${
                  taskStatusFilter === status
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {showTaskForm && (
            <TaskCreateModal
              onSubmit={handleCreateTask}
              onClose={() => setShowTaskForm(false)}
              users={users}
            />
          )}

          {viewMode === 'grid' ? (
            <TaskGrid
              tasks={(() => {
                // First filter by view (assigned/sent) - users can only see their own tasks
                let filteredTasks = tasks.filter((task) => {
                  if (taskViewFilter === 'assigned') {
                    // Show tasks assigned to current user
                    return task.assignedTo === currentUser?.email;
                  } else {
                    // Show tasks created/sent by current user
                    return task.createdBy === currentUser?.email;
                  }
                });

                // Then filter by status
                if (taskStatusFilter !== 'all') {
                  filteredTasks = filteredTasks.filter(
                    (task) => task.status === taskStatusFilter
                  );
                }

                return filteredTasks;
              })()}
              onSetStatus={handleSetStatus}
              onSeeDetails={handleSeeDetails}
              onSetUser={handleSetUser}
              onAddCommentary={handleAddCommentary}
            />
          ) : (
            <TaskList
              tasks={(() => {
                // First filter by view (assigned/sent) - users can only see their own tasks
                let filteredTasks = tasks.filter((task) => {
                  if (taskViewFilter === 'assigned') {
                    // Show tasks assigned to current user
                    return task.assignedTo === currentUser?.email;
                  } else {
                    // Show tasks created/sent by current user
                    return task.createdBy === currentUser?.email;
                  }
                });

                // Then filter by status
                if (taskStatusFilter !== 'all') {
                  filteredTasks = filteredTasks.filter(
                    (task) => task.status === taskStatusFilter
                  );
                }

                return filteredTasks;
              })()}
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
              onDelete={isAdmin ? handleDeleteTask : null}
              users={users}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
            <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
              <p className="text-sm text-gray-500 mt-1">
                Browse, search, and manage your uploaded files.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={documentSearch}
                  onChange={(e) => setDocumentSearch(e.target.value)}
                  placeholder="Search by name or type..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z"
                  />
                </svg>
              </div>
              <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm text-center">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              + Upload Document
            </label>
          </div>
          </div>

          <DocumentsList
            documents={documents}
            searchTerm={documentSearch}
            onDownload={handleDownloadDocument}
            onDelete={handleDeleteDocument}
          />
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Stock</h2>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <button
                  onClick={() => setShowTypesManagement(true)}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition"
                >
                  Manage Types
                </button>
              )}
              <button
                onClick={() => {
                  setEditingStockType(null);
                  setShowStockTypeForm(true);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
              >
                + Add Type
              </button>
              <button
                onClick={() => setShowStockItemForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + Add Product
              </button>
            </div>
          </div>

          {/* Admin-only Types Management Modal */}
          {isAdmin && showTypesManagement && (
            <div className="fixed inset-0 z-[60] p-4 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowTypesManagement(false)}
              />
              <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-xl border border-gray-200 max-h-[85vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Stock Types</h3>
                  <button
                    onClick={() => setShowTypesManagement(false)}
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-3">
                  {stockTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-medium text-gray-900 truncate">{type.name}</span>
                          {type.row && type.col && (
                            <span className="text-sm text-gray-500">
                              Location: Row {type.row}, Col {type.col}
                            </span>
                          )}
                        </div>
                        {type.description && (
                          <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStockType({ id: type.id, ...type });
                            setShowStockTypeForm(true);
                            setShowTypesManagement(false);
                          }}
                          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to delete "${type.name}"? This will not delete products of this type.`
                              )
                            ) {
                              handleDeleteStockType(type.id);
                            }
                          }}
                          className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {stockTypes.length === 0 && (
                    <p className="text-gray-500 text-center py-10">No stock types found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stock overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(() => {
              // Apply type filter
              let scopedItems =
                selectedStockTypeId === 'all'
                  ? stockItems
                  : stockItems.filter((i) => i.typeId === selectedStockTypeId);
              
              // Apply availability filter
              if (selectedStockAvailability !== 'all') {
                const isAvailable = selectedStockAvailability === 'available';
                scopedItems = scopedItems.filter(
                  (i) => (i.available !== false) === isAvailable
                );
              }

              const totalProducts = scopedItems.length;
              const totalQuantity = scopedItems.reduce(
                (sum, i) => sum + (Number(i.quantity) || 0),
                0
              );
              const outOfStock = scopedItems.filter(
                (i) => (Number(i.quantity) || 0) === 0
              ).length;
              // Calculate available quantity (sum of quantities, not count of items)
              const available = scopedItems
                .filter((i) => i.available !== false)
                .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
              // Calculate not available quantity (sum of quantities, not count of items)
              const notAvailable = scopedItems
                .filter((i) => i.available === false)
                .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

              return (
                <>
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 shadow-sm">
                    <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-blue-50 opacity-60" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Products
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">
                          {totalProducts}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          In current filter
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M3 12l2-2 4 4L19 4l2 2-12 12-6-6z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-slate-100 p-4 shadow-sm">
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-violet-50 opacity-60" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Total Quantity
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">
                          {totalQuantity}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Sum of all items
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-violet-500 text-white flex items-center justify-center shadow-md">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M4 6h16M4 12h10M4 18h6"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-4 shadow-sm">
                    <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-emerald-50 opacity-70" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                          Available
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-emerald-700">
                          {available}
                        </p>
                        <p className="text-[11px] text-emerald-700/70 mt-1">
                          Total available quantity
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-slate-50 p-4 shadow-sm">
                    <div className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-amber-50 opacity-70" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                          Not Available
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-amber-700">
                          {notAvailable}
                        </p>
                        <p className="text-[11px] text-amber-700/70 mt-1">
                          Blocked / not usable quantity
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M12 9v4m0 4h.01M10.29 3.86L3.82 16a1.6 1.6 0 001.4 2.35h13.56a1.6 1.6 0 001.4-2.35L13.71 3.86a1.6 1.6 0 00-2.82 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-slate-50 p-4 shadow-sm">
                    <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-red-50 opacity-70" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                          Out of Stock
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-red-700">
                          {outOfStock}
                        </p>
                        <p className="text-[11px] text-red-700/70 mt-1">
                          Products that need restock
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative w-full lg:w-72">
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z"
                />
              </svg>
            </div>
            {/* View toggle */}
            <div className="flex justify-start lg:justify-end">
              <div className="inline-flex border border-gray-200 rounded-full overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => setStockViewMode('grid')}
                  className={`px-4 py-2 text-sm font-medium ${
                    stockViewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setStockViewMode('list')}
                  className={`px-4 py-2 text-sm font-medium ${
                    stockViewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Filters using select inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Type
              </label>
              <select
                value={selectedStockTypeId}
                onChange={(e) => setSelectedStockTypeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All types</option>
                {stockTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Availability
              </label>
              <select
                value={selectedStockAvailability}
                onChange={(e) => setSelectedStockAvailability(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="not_available">Not Available</option>
              </select>
            </div>
          </div>

          {showStockTypeForm && (
            <StockTypeForm
              onSubmit={handleCreateStockType}
              onClose={() => {
                setShowStockTypeForm(false);
                setEditingStockType(null);
              }}
              initialData={editingStockType}
            />
          )}

          {showStockItemForm && (
            <StockItemForm
              types={stockTypes}
              onSubmit={handleCreateStockItem}
              onClose={() => setShowStockItemForm(false)}
            />
          )}

          <StockList
            items={stockItems}
            types={stockTypes}
            selectedTypeId={selectedStockTypeId}
            selectedAvailability={selectedStockAvailability}
            searchTerm={stockSearch}
            viewMode={stockViewMode}
            onChangeQuantity={handleChangeStockQuantity}
            onSelectItem={handleSelectStockItem}
          />

            {selectedStockItem && (
              <StockDetailModal
                item={selectedStockItem}
                types={stockTypes}
                onClose={() => setSelectedStockItem(null)}
                onUpdate={handleUpdateStockItem}
                onDelete={isAdmin ? handleDeleteStockItem : null}
              />
            )}
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
