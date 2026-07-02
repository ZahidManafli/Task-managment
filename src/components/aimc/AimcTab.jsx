import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import ProjectCard from './ProjectCard';
import ProjectFormModal from './ProjectFormModal';

const AimcTab = () => {
  const { isAdmin, currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectModal, setProjectModal] = useState(null); // null = closed, 'new' = create, project object = edit

  useEffect(() => {
    if (!isAdmin) return;

    const projectsQuery = query(collection(db, 'aimcProjects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      setProjects(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-xl text-red-600 font-semibold mb-2">Access Denied</p>
          <p className="text-gray-600">Only administrators can access AİMC.</p>
        </div>
      </div>
    );
  }

  const handleSubmitProject = async (projectData) => {
    if (projectModal && projectModal !== 'new') {
      await updateDoc(doc(db, 'aimcProjects', projectModal.id), {
        ...projectData,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, 'aimcProjects'), {
        ...projectData,
        costs: [],
        createdBy: currentUser?.email || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    setProjectModal(null);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    await deleteDoc(doc(db, 'aimcProjects', projectId));
  };

  const handleAddCost = async (project, costData) => {
    const newCost = {
      id: crypto.randomUUID(),
      title: costData.title,
      description: costData.description,
      value: costData.value,
      createdAt: new Date(),
    };
    await updateDoc(doc(db, 'aimcProjects', project.id), {
      costs: [...(project.costs || []), newCost],
      updatedAt: serverTimestamp(),
    });
  };

  const handleUpdateCost = async (project, costId, costData) => {
    const updatedCosts = (project.costs || []).map((c) =>
      c.id === costId
        ? { ...c, title: costData.title, description: costData.description, value: costData.value }
        : c
    );
    await updateDoc(doc(db, 'aimcProjects', project.id), {
      costs: updatedCosts,
      updatedAt: serverTimestamp(),
    });
  };

  const handleDeleteCost = async (project, costId) => {
    const updatedCosts = (project.costs || []).filter((c) => c.id !== costId);
    await updateDoc(doc(db, 'aimcProjects', project.id), {
      costs: updatedCosts,
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AİMC</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage projects, assign costs and track profitability
          </p>
        </div>
        <button
          onClick={() => setProjectModal('new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Create Project
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No projects yet. Create your first one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => setProjectModal(project)}
              onDelete={() => handleDeleteProject(project.id)}
              onAddCost={(costData) => handleAddCost(project, costData)}
              onUpdateCost={(costId, costData) => handleUpdateCost(project, costId, costData)}
              onDeleteCost={(costId) => handleDeleteCost(project, costId)}
            />
          ))}
        </div>
      )}

      {projectModal && (
        <ProjectFormModal
          initialData={projectModal === 'new' ? null : projectModal}
          onClose={() => setProjectModal(null)}
          onSubmit={handleSubmitProject}
        />
      )}
    </div>
  );
};

export default AimcTab;
