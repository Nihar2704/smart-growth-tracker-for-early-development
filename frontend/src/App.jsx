import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ChildrenList from './pages/ChildrenList';
import ChildDetail from './pages/ChildDetail';
import MilestoneTracker from './pages/MilestoneTracker';
import Login from './pages/Login';
import Register from './pages/Register';
import AddChildModal from './components/AddChildModal';
import { useAuth } from './context/AuthContext';
import { getChildren, createChild, updateChild, deleteChild } from './services/api';

export default function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState('dashboard');
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [childToEdit, setChildToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default theme: 'light' per UI_Implementation_Guidelines.md
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sgt_theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
    localStorage.setItem('sgt_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const fetchChildrenList = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await getChildren();
      setChildren(data);
      if (selectedChildId) {
        const found = data.find((c) => c.id === selectedChildId);
        setSelectedChild(found || null);
      } else if (data.length > 0) {
        setSelectedChildId(data[0].id);
        setSelectedChild(data[0]);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load children:', err);
      setError('Could not connect to backend server or fetch child records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchChildrenList();
    }
  }, [isAuthenticated]);

  const handleSelectChild = (id) => {
    setSelectedChildId(id);
    const found = children.find((c) => c.id === id);
    setSelectedChild(found || null);
    setCurrentView('growth');
  };

  const handleSelectChildForMilestones = (id) => {
    setSelectedChildId(id);
    const found = children.find((c) => c.id === id);
    setSelectedChild(found || null);
  };

  const handleOpenAddModal = () => {
    setChildToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (child) => {
    setChildToEdit(child);
    setIsAddModalOpen(true);
  };

  const handleSaveChild = async (childData, idToEdit = null) => {
    if (idToEdit) {
      await updateChild(idToEdit, childData);
    } else {
      const newChild = await createChild(childData);
      setSelectedChildId(newChild.id);
      setSelectedChild(newChild);
    }
    await fetchChildrenList();
  };

  const handleDeleteChild = async (id) => {
    if (window.confirm('Are you sure you want to delete this child profile and all associated growth data?')) {
      await deleteChild(id);
      if (selectedChildId === id) {
        setSelectedChildId(null);
        setSelectedChild(null);
        setCurrentView('children');
      }
      await fetchChildrenList();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-600">Loading Smart Growth Tracker...</p>
        </div>
      </div>
    );
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme}`}>
      <Navbar
        onOpenAddChild={handleOpenAddModal}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex flex-1 overflow-hidden">
                <Sidebar
                  currentView={currentView}
                  setCurrentView={(view) => {
                    if ((view === 'growth' || view === 'milestones') && !selectedChildId && children.length > 0) {
                      handleSelectChildForMilestones(children[0].id);
                    }
                    setCurrentView(view);
                  }}
                  selectedChildId={selectedChildId}
                />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
                  {error && (
                    <div className="mb-6 p-4 border border-[var(--status-error-border)] bg-[var(--status-error-bg)] rounded-lg text-[var(--status-error-text)] text-xs flex items-center justify-between">
                      <span>{error}</span>
                      <button
                        onClick={fetchChildrenList}
                        className="px-3 py-1 btn-secondary text-xs font-medium cursor-pointer"
                      >
                        Retry Connection
                      </button>
                    </div>
                  )}

                  {currentView === 'dashboard' && (
                    <Dashboard
                      children={children}
                      onSelectChild={handleSelectChild}
                      onOpenAddChild={handleOpenAddModal}
                      onNavigateChildren={() => setCurrentView('children')}
                    />
                  )}

                  {currentView === 'children' && (
                    <ChildrenList
                      children={children}
                      onSelectChild={handleSelectChild}
                      onOpenAddChild={handleOpenAddModal}
                      onEditChild={handleOpenEditModal}
                      onDeleteChild={handleDeleteChild}
                    />
                  )}

                  {currentView === 'growth' && (
                    selectedChild ? (
                      <ChildDetail
                        child={selectedChild}
                        onBack={() => setCurrentView('children')}
                      />
                    ) : (
                      <div className="panel-card p-8 text-center space-y-3 max-w-md mx-auto my-12">
                        <h3 className="text-base font-semibold text-[var(--text-main)]">No Child Profile Selected</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Please select a child profile from the list or create a new profile.</p>
                        <button
                          onClick={() => setCurrentView('children')}
                          className="px-4 py-2 btn-primary text-xs cursor-pointer"
                        >
                          View Children List
                        </button>
                      </div>
                    )
                  )}

                  {currentView === 'milestones' && (
                    <MilestoneTracker
                      children={children}
                      selectedChild={selectedChild}
                      onSelectChild={handleSelectChildForMilestones}
                    />
                  )}
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>

      {isAuthenticated && (
        <AddChildModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveChild}
          childToEdit={childToEdit}
        />
      )}
    </div>
  );
}
