import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, updateUserRole, deleteAdminUser } from '../../store/slices/adminSlice';
import { FiUsers, FiSearch, FiTrash2, FiShield, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../../components/AdminLayout/AdminLayout.css';

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, loading, actionLoading } = useSelector((s) => s.admin);
  const { userInfo } = useSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { dispatch(fetchAdminUsers()); }, [dispatch]);

  const handleRoleToggle = async (user) => {
    if (user._id === userInfo._id) { toast.error("You can't change your own role"); return; }
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const res = await dispatch(updateUserRole({ id: user._id, role: newRole }));
    if (res.meta.requestStatus === 'fulfilled') toast.success(`Role updated to ${newRole}`);
    else toast.error('Failed to update role');
  };

  const handleDelete = async (id) => {
    const res = await dispatch(deleteAdminUser(id));
    setConfirmDelete(null);
    if (res.meta.requestStatus === 'fulfilled') toast.success('User deleted');
    else toast.error('Failed to delete user');
  };

  const filtered = users.filter((u) =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Pagination ─────────────────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => { setCurrentPage(1); }, [search]);
  
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users Management</h1>
          <p className="admin-page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div className="admin-card" style={{ paddingBottom: 0 }}>
        <div style={{ marginBottom:'1.25rem' }}>
          <div style={{ position:'relative', maxWidth:320 }}>
            <FiSearch size={14} style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
            <input
              className="admin-search"
              style={{ paddingLeft:'2rem', width:'100%', boxSizing:'border-box' }}
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="admin-empty">
                      <div className="admin-empty-icon"><FiUsers /></div>
                      <p>No users found</p>
                    </div>
                  </td></tr>
                ) : paginatedData.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        <div style={{
                          width:34, height:34, borderRadius:'50%',
                          background: u.role === 'admin'
                            ? 'linear-gradient(135deg,#c9a96e,#a07840)'
                            : 'rgba(100,116,139,0.3)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:'0.85rem', fontWeight:700, color:'#fff', flexShrink:0,
                        }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight:600, color:'#e2e8f0' }}>{u.name}</span>
                        {u._id === userInfo._id && (
                          <span style={{ fontSize:'0.65rem', background:'rgba(34,197,94,0.15)', color:'#22c55e', padding:'0.1rem 0.4rem', borderRadius:4, fontWeight:700 }}>
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color:'#94a3b8' }}>{u.email}</td>
                    <td style={{ color:'#64748b', fontSize:'0.8rem' }}>{u.phone || '—'}</td>
                    <td>
                      <span className={`status-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color:'#64748b', fontSize:'0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <button
                          className="btn-admin-ghost"
                          onClick={() => handleRoleToggle(u)}
                          disabled={actionLoading || u._id === userInfo._id}
                          title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          style={{ padding:'0.35rem 0.6rem' }}
                        >
                          {u.role === 'admin' ? <FiUser size={14} /> : <FiShield size={14} />}
                        </button>
                        <button
                          className="btn-admin-danger"
                          onClick={() => setConfirmDelete(u)}
                          disabled={actionLoading || u._id === userInfo._id || u.role === 'admin'}
                          style={{ padding:'0.35rem 0.6rem' }}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* ── Pagination Controls ── */}
            {totalPages > 1 && (
              <div className="admin-pagination">
                <div className="admin-pagination-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
                </div>
                <div className="admin-pagination-controls">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </button>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth:400, textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>⚠️</div>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:'#e2e8f0', marginBottom:'0.5rem' }}>Delete User?</h3>
            <p style={{ color:'#94a3b8', marginBottom:'1.5rem', fontSize:'0.9rem' }}>
              Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center' }}>
              <button className="btn-admin-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-admin-danger" onClick={() => handleDelete(confirmDelete._id)} disabled={actionLoading}>
                {actionLoading ? 'Deleting…' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
