import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { toast } from 'react-toastify';

type ReviewItem = {
  id: number;
  userId: number;
  username?: string;
  roomId: number;
  roomNumber?: string;
  bookingId?: number | null;
  rating: number;
  comment?: string;
  adminResponse?: string;
  respondedAt?: string | null;
  approved: boolean;
  createdAt: string;
};

const ReviewManagement = () => {
  const [pending, setPending] = useState<ReviewItem[]>([]);
  const [allReviews, setAllReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [responding, setResponding] = useState<{ id: number; text: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, a] = await Promise.all([
        adminService.getPendingReviews(),
        adminService.getAllReviews()
      ]);
      setPending(p || []);
      setAllReviews(a || []);
    } catch (err: any) {
      toast.error(`Lỗi tải đánh giá: ${err?.message || 'Không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onApprove = async (id: number) => {
    try {
      await adminService.approveReview(id);
      toast.success('Đã duyệt đánh giá');
      await loadData();
    } catch (err: any) {
      toast.error(`Duyệt thất bại: ${err?.message || 'Không xác định'}`);
    }
  };

  const onDelete = async (id: number) => {
    if (!globalThis.confirm('Xóa đánh giá này?')) return;
    try {
      await adminService.deleteReview(id);
      toast.success('Đã xóa đánh giá');
      await loadData();
    } catch (err: any) {
      toast.error(`Xóa thất bại: ${err?.message || 'Không xác định'}`);
    }
  };

  const openRespond = (id: number, current?: string) => {
    setResponding({ id, text: current || '' });
  };

  const submitRespond = async () => {
    if (!responding) return;
    try {
      await adminService.respondToReview(responding.id, responding.text);
      toast.success('Đã phản hồi đánh giá');
      setResponding(null);
      await loadData();
    } catch (err: any) {
      toast.error(`Phản hồi thất bại: ${err?.message || 'Không xác định'}`);
    }
  };

  const rows = useMemo(() => (activeTab === 'pending' ? pending : allReviews), [activeTab, pending, allReviews]);

  return (
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Quản Lý Đánh Giá</h2>
        <button className="btn btn-outline-secondary" onClick={loadData} disabled={loading}>
          {loading ? 'Đang tải...' : 'Tải lại'}
        </button>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
            Chờ duyệt ({pending.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            Tất cả ({allReviews.length})
          </button>
        </li>
      </ul>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Phòng</th>
              <th>Người dùng</th>
              <th>Điểm</th>
              <th>Bình luận</th>
              <th>Phê duyệt</th>
              <th>Phản hồi</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>
                  {r.roomNumber ? `Phòng ${r.roomNumber}` : `Room #${r.roomId}`}
                  {r.bookingId ? <div className="text-muted small">Booking #{r.bookingId}</div> : null}
                </td>
                <td>{r.username || r.userId}</td>
                <td>
                  <span className="badge bg-warning text-dark">{r.rating} / 5</span>
                </td>
                <td style={{ maxWidth: 300 }}>
                  <div className="text-truncate" title={r.comment || ''}>{r.comment || '-'}</div>
                </td>
                <td>
                  {r.approved ? <span className="badge bg-success">Đã duyệt</span> : <span className="badge bg-secondary">Chờ duyệt</span>}
                </td>
                <td style={{ maxWidth: 250 }}>
                  {r.adminResponse ? (
                    <div>
                      <div className="text-truncate" title={r.adminResponse}>{r.adminResponse}</div>
                      {r.respondedAt ? <div className="small text-muted">{new Date(r.respondedAt).toLocaleString()}</div> : null}
                    </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="small text-muted">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="d-flex gap-2">
                  {!r.approved && (
                    <button className="btn btn-sm btn-success" onClick={() => onApprove(r.id)}>Duyệt</button>
                  )}
                  <button className="btn btn-sm btn-outline-primary" onClick={() => openRespond(r.id, r.adminResponse)}>
                    Phản hồi
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(r.id)}>Xóa</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted py-5">Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Respond Modal */}
      {responding && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Phản hồi đánh giá #{responding.id}</h5>
                <button type="button" className="btn-close" onClick={() => setResponding(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label" htmlFor="review-response-text">Nội dung phản hồi</label>
                  <textarea id="review-response-text" className="form-control" rows={5} value={responding.text} onChange={(e) => setResponding({ id: responding.id, text: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setResponding(null)}>Hủy</button>
                <button className="btn btn-primary" onClick={submitRespond}>Gửi phản hồi</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
