import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

const STATUS_COLS = [
  { key: 'TODO', label: 'To Do', dotClass: 'dot-todo' },
  { key: 'IN_PROGRESS', label: 'In Progress', dotClass: 'dot-in-progress' },
  { key: 'DONE', label: 'Done', dotClass: 'dot-done' },
];

// ─── Task Modal ─────────────────────────────────────────────────
function TaskModal({ task, members, projectId, onClose, onSave }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    assigneeId: task?.assigneeId || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || null, assigneeId: form.assigneeId || null };
      let res;
      if (isEdit) {
        res = await api.put(`/tasks/${projectId}/${task.id}`, payload);
        onSave(res.data.task, 'update');
      } else {
        res = await api.post(`/projects/${projectId}/tasks`, payload);
        onSave(res.data.task, 'create');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Title *</label>
              <input id="task-title" className="form-input" placeholder="Task title" required
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea id="task-desc" className="form-textarea" placeholder="Add details..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-status">Status</label>
                <select id="task-status" className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">Priority</label>
                <select id="task-priority" className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-due">Due Date</label>
                <input id="task-due" type="date" className="form-input" value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-assignee">Assign To</label>
                <select id="task-assignee" className="form-select" value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="task-save-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Member Modal ────────────────────────────────────────────
function AddMemberModal({ projectId, existingIds, onClose, onAdded }) {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users').then(res => {
      setUsers(res.data.users.filter(u => !existingIds.includes(u.id)));
    });
  }, [existingIds]);

  const handleAdd = async () => {
    if (!selectedId) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/members`, { userId: selectedId });
      onAdded(res.data.member);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Add Member</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="member-select">Select User</label>
            <select id="member-select" className="form-select" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">Choose a user...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button id="add-member-submit" className="btn btn-primary" onClick={handleAdd} disabled={!selectedId || loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Board (Drag & Drop) ──────────────────────────────────
function KanbanBoard({ tasks, onTaskClick, onTaskDrop }) {
  const dragTaskId = useRef(null);
  const [draggingOver, setDraggingOver] = useState(null); // column key being hovered

  const handleDragStart = (e, taskId) => {
    dragTaskId.current = taskId;
    e.dataTransfer.effectAllowed = 'move';
    // slight delay so the ghost image renders before opacity change
    setTimeout(() => { if (e.target) e.target.style.opacity = '0.45'; }, 0);
  };

  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1';
    dragTaskId.current = null;
    setDraggingOver(null);
  };

  const handleDragOver = (e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggingOver(colKey);
  };

  const handleDrop = (e, colKey) => {
    e.preventDefault();
    setDraggingOver(null);
    const taskId = dragTaskId.current;
    if (!taskId) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === colKey) return;
    onTaskDrop(taskId, colKey);
  };

  return (
    <div className="kanban-board">
      {STATUS_COLS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        const isOver = draggingOver === col.key;
        return (
          <div
            key={col.key}
            className="kanban-col"
            onDragOver={e => handleDragOver(e, col.key)}
            onDragLeave={() => setDraggingOver(null)}
            onDrop={e => handleDrop(e, col.key)}
            style={{
              transition: 'border-color 0.15s, background 0.15s',
              borderColor: isOver ? 'var(--accent)' : undefined,
              background: isOver ? 'rgba(108,99,255,0.06)' : undefined,
            }}
          >
            <div className="kanban-col-header">
              <div className="kanban-col-title">
                <div className={`kanban-col-dot ${col.dotClass}`} />
                {col.label}
              </div>
              <span className="kanban-col-count">{colTasks.length}</span>
            </div>
            {colTasks.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '30px 0',
                color: isOver ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 13, border: `2px dashed ${isOver ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', transition: 'all 0.15s',
              }}>
                {isOver ? 'Drop here' : 'No tasks'}
              </div>
            ) : (
              colTasks.map(task => (
                <div
                  key={task.id}
                  id={`task-${task.id}`}
                  className="task-card"
                  draggable
                  onDragStart={e => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onTaskClick(task)}
                  style={{ cursor: 'grab' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                    {isOverdue(task) && <span className="badge badge-overdue">⚠ Overdue</span>}
                  </div>
                  <div className="task-card-title">{task.title}</div>
                  {task.description && <div className="task-card-desc">{task.description}</div>}
                  <div className="task-card-meta">
                    <div className="task-card-assignee">
                      {task.assignee ? (
                        <>
                          <div className="assignee-avatar">{task.assignee.name[0].toUpperCase()}</div>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{task.assignee.name}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unassigned</span>
                      )}
                    </div>
                    {task.dueDate && (
                      <span className={`task-card-due ${isOverdue(task) ? 'overdue' : ''}`}>
                        📅 {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                  {/* Drag handle hint */}
                  <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>⠿</span> drag to move
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [taskModal, setTaskModal] = useState(null); // null | 'new' | task-object
  const [memberModal, setMemberModal] = useState(false);

  const fetchProject = () => {
    api.get(`/projects/${id}`).then(res => setProject(res.data.project)).catch(() => navigate('/projects')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProject(); }, [id]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!project) return null;

  const myMembership = project.members.find(m => m.user.id === user.id);
  const isProjectAdmin = isAdmin || myMembership?.role === 'ADMIN';

  const handleTaskSave = (savedTask, mode) => {
    if (mode === 'create') {
      setProject(p => ({ ...p, tasks: [savedTask, ...p.tasks] }));
    } else {
      setProject(p => ({ ...p, tasks: p.tasks.map(t => t.id === savedTask.id ? savedTask : t) }));
    }
  };

  // Optimistic update: move card instantly, then persist to API
  const handleTaskDrop = async (taskId, newStatus) => {
    setProject(p => ({
      ...p,
      tasks: p.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t),
    }));
    try {
      await api.put(`/tasks/${id}/${taskId}`, { status: newStatus });
    } catch {
      // Revert on failure
      fetchProject();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}/${taskId}`);
    setProject(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== taskId) }));
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    await api.delete(`/projects/${id}/members/${memberId}`);
    setProject(p => ({ ...p, members: p.members.filter(m => m.user.id !== memberId) }));
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
  };

  const existingMemberIds = project.members.map(m => m.user.id);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')} style={{ padding: '6px 8px' }}>← Back</button>
              <h1>{project.name}</h1>
              {isProjectAdmin && <span className="badge badge-admin">Admin</span>}
            </div>
            {project.description && <p style={{ marginTop: 6 }}>{project.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button id="add-task-btn" className="btn btn-primary" onClick={() => setTaskModal('new')}>+ Add Task</button>
            {isProjectAdmin && (
              <>
                <button id="add-member-btn" className="btn btn-secondary" onClick={() => setMemberModal(true)}>+ Member</button>
                <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>
          📋 Kanban Board ({project.tasks.length})
        </button>
        <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
          👥 Members ({project.members.length})
        </button>
      </div>

      {/* Board Tab */}
      {activeTab === 'board' && (
        <>
          {project.tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No tasks yet</h3>
              <p>Add your first task to get started.</p>
              <button className="btn btn-primary" onClick={() => setTaskModal('new')}>Add Task</button>
            </div>
          ) : (
            <KanbanBoard tasks={project.tasks} onTaskClick={(t) => setTaskModal(t)} onTaskDrop={handleTaskDrop} />
          )}
        </>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div style={{ maxWidth: 600 }}>
          <div className="members-list">
            {project.members.map(m => (
              <div key={m.user.id} className="member-row">
                <div className="user-avatar" style={{ width: 38, height: 38, fontSize: 15 }}>
                  {m.user.name[0].toUpperCase()}
                </div>
                <div className="member-row-info">
                  <div className="member-row-name">{m.user.name}</div>
                  <div className="member-row-email">{m.user.email}</div>
                </div>
                <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
                {isProjectAdmin && m.user.id !== user.id && (
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleRemoveMember(m.user.id)} title="Remove">×</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {taskModal && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          members={project.members}
          projectId={id}
          onClose={() => setTaskModal(null)}
          onSave={handleTaskSave}
        />
      )}
      {memberModal && (
        <AddMemberModal
          projectId={id}
          existingIds={existingMemberIds}
          onClose={() => setMemberModal(false)}
          onAdded={(member) => setProject(p => ({ ...p, members: [...p.members, member] }))}
        />
      )}
    </div>
  );
}
