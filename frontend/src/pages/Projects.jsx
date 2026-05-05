import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const EMOJIS = ['🚀', '💡', '🎯', '🔥', '⚡', '🌟', '🛠️', '📊'];

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      onCreated(res.data.project);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>New Project</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="proj-name">Project Name *</label>
              <input id="proj-name" className="form-input" placeholder="e.g. Website Redesign"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="proj-desc">Description</label>
              <textarea id="proj-desc" className="form-textarea" placeholder="What is this project about?"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="create-project-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data.projects)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Projects</h1>
            <p>Manage your team projects and track progress.</p>
          </div>
          <button id="new-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p, i) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="project-card" id={`project-card-${p.id}`}>
              <div className="project-card-header">
                <div className="project-icon">{EMOJIS[i % EMOJIS.length]}</div>
                <span className="badge badge-member">{p._count?.tasks ?? 0} tasks</span>
              </div>
              <div className="project-card-name">{p.name}</div>
              <div className="project-card-desc">{p.description || 'No description'}</div>
              <div className="project-card-footer">
                <div className="member-avatars">
                  {p.members.slice(0, 4).map((m) => (
                    <div key={m.user.id} className="member-avatar" title={m.user.name}>
                      {m.user.name.slice(0, 1).toUpperCase()}
                    </div>
                  ))}
                  {p.members.length > 4 && (
                    <div className="member-avatar">+{p.members.length - 4}</div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => setProjects(prev => [p, ...prev])}
        />
      )}
    </div>
  );
}
