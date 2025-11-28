import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import type { UserDTO } from '../../services/admin.service';

const UserManagement = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách người dùng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: UserDTO) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // Update user info
      await adminService.updateUser(editingUser.id, {
        fullName: editForm.fullName,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber
      });

      // Update role if changed
      if (editForm.role !== editingUser.role) {
        await adminService.updateUserRole(editingUser.id, editForm.role);
      }

      alert('Cập nhật người dùng thành công!');
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      alert('Không thể cập nhật người dùng');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await adminService.deleteUser(id);
      alert('Đã xóa người dùng thành công!');
      loadUsers();
    } catch (err: any) {
      alert('Không thể xóa người dùng');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="users-tab">
      <h2>Quản Lý Người Dùng</h2>
      
      {/* Search Bar */}
      <div className="mb-3 mt-4">
        <div className="input-group">
          <span className="input-group-text">
            <i className="fa fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo ID, tên đăng nhập, họ tên, email, SĐT, vai trò..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive mt-4">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Đăng Nhập</th>
              <th>Họ Tên</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Vai Trò</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((user) => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  user.id.toString().includes(query) ||
                  user.username.toLowerCase().includes(query) ||
                  user.fullName.toLowerCase().includes(query) ||
                  user.email.toLowerCase().includes(query) ||
                  (user.phoneNumber && user.phoneNumber.includes(searchQuery)) ||
                  user.role.toLowerCase().includes(query)
                );
              })
              .map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber || '-'}</td>
                <td>
                  <span className={`badge ${
                    user.role === 'ADMIN' ? 'bg-danger' : 
                    user.role === 'STAFF' ? 'bg-warning' : 'bg-secondary'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => handleEditClick(user)}
                  >
                    <i className="fa fa-edit"></i> Sửa
                  </button>
                  {user.role !== 'ADMIN' && (
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <i className="fa fa-trash"></i> Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chỉnh Sửa Người Dùng</h5>
                <button type="button" className="btn-close" onClick={() => setEditingUser(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Họ Tên</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Số Điện Thoại</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Vai Trò</label>
                    <select
                      className="form-select"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      required
                    >
                      <option value="USER">USER</option>
                      <option value="STAFF">STAFF</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Lưu Thay Đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
