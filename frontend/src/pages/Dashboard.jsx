import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

const formatDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const statusBadge = (status) => {
  const map = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', DONE: 'badge-done' };
  const labels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
  return <span className={`badge ${map[status]}`}>{labels[status]}</span>;
};

const priorityBadge = (p) => {
  const map = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' };
  return <span className={`badge ${map[p]}`}>{p}</span>;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const { stats, myTasks, recentTasks } = data;

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: '📁', cls: 'purple' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: '📋', cls: 'blue' },
    { label: 'In Progress', value: stats.inProgressCount, icon: '⚡', cls: 'orange' },
    { label: 'Completed', value: stats.doneCount, icon: '✅', cls: 'green' },
    { label: 'Overdue', value: stats.overdueCount, icon: '🔴', cls: 'red' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's what's happening across your projects today.</p>
      </div>

      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* My Tasks */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>My Open Tasks</h2>
            <Link to="/projects" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {myTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">🎉</div>
              <p>No pending tasks!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myTasks.map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.project?.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {statusBadge(task.status)}
                    {task.dueDate && (
                      <span className={`badge ${isOverdue(task) ? 'badge-overdue' : 'badge-todo'}`}>
                        {isOverdue(task) ? '⚠ ' : ''}{formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Tasks</h2>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <p>No tasks yet</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map(task => (
                    <tr key={task.id}>
                      <td style={{ fontWeight: 500, maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{task.project?.name}</td>
                      <td>{statusBadge(task.status)}</td>
                      <td>{priorityBadge(task.priority)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
