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
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stockTypes, setStockTypes] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [selectedStockTypeId, setSelectedStockTypeId] = useState('all');
  const [selectedStockAvailability, setSelectedStockAvailability] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [stockViewMode, setStockViewMode] = useState('grid');
  const [documentSearch, setDocumentSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showStockTypeForm, setShowStockTypeForm] = useState(false);
  const [showStockItemForm, setShowStockItemForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedStockItem, setSelectedStockItem] = useState(null);
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
      await addDoc(collection(db, 'stockTypes'), {
        ...typeData,
        createdAt: new Date(),
        createdBy: currentUser.email,
      });
      setShowStockTypeForm(false);
    } catch (error) {
      console.error('Error creating stock type:', error);
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
            />
          )}

          {viewMode === 'grid' ? (
            <TaskGrid
              tasks={
                taskStatusFilter === 'all'
                  ? tasks
                  : tasks.filter((task) => task.status === taskStatusFilter)
              }
              onSetStatus={handleSetStatus}
              onSeeDetails={handleSeeDetails}
              onSetUser={handleSetUser}
              onAddCommentary={handleAddCommentary}
            />
          ) : (
            <TaskList
              tasks={
                taskStatusFilter === 'all'
                  ? tasks
                  : tasks.filter((task) => task.status === taskStatusFilter)
              }
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
              <button
                onClick={() => setShowStockTypeForm(true)}
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
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Products
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {totalProducts}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      In current filter
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Total Quantity
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {totalQuantity}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Sum of all items
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Available
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-green-600">
                      {available}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Available products
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Not Available
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-red-600">
                      {notAvailable}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Not available products
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Out of Stock
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-red-600">
                      {outOfStock}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Needs restock
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="flex justify-end">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setStockViewMode('grid')}
                className={`px-4 py-2 text-sm ${
                  stockViewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setStockViewMode('list')}
                className={`px-4 py-2 text-sm ${
                  stockViewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* Type filter sub-tabs */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center">Type:</span>
              <button
                onClick={() => setSelectedStockTypeId('all')}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedStockTypeId === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {stockTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedStockTypeId(type.id)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    selectedStockTypeId === type.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center">Availability:</span>
              <button
                onClick={() => setSelectedStockAvailability('all')}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedStockAvailability === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStockAvailability('available')}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedStockAvailability === 'available'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setSelectedStockAvailability('not_available')}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedStockAvailability === 'not_available'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Not Available
              </button>
            </div>
          </div>

          {showStockTypeForm && (
            <StockTypeForm
              onSubmit={handleCreateStockType}
              onClose={() => setShowStockTypeForm(false)}
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
            selectedTypeId={selectedStockTypeId}
            selectedAvailability={selectedStockAvailability}
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
              onDelete={handleDeleteStockItem}
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
