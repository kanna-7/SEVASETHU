import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Plus, ClipboardList, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getInventory, getNeeds, addNeed } from '../../services/api';

export default function ManagerInventoryPage() {
  const { isManager, loading: authLoading } = useAuth();
  const [stockItems, setStockItems] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form for requesting a need
  const [form, setForm] = useState({
    item: '',
    quantity: 1,
    priority: 'medium',
  });

  const fetchData = async () => {
    try {
      const [stockRes, needsRes] = await Promise.all([
        getInventory(),
        getNeeds(),
      ]);
      setStockItems(stockRes.data.data);
      setNeeds(needsRes.data.data);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isManager) {
      fetchData();
    }
  }, [isManager]);

  if (authLoading) return null;
  if (!isManager) return <Navigate to="/login" />;

  const handleRequestNeed = async (e) => {
    e.preventDefault();
    if (!form.item.trim() || form.quantity <= 0) return;
    
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await addNeed(form);
      setSuccessMsg('Need request submitted successfully! Pending admin approval.');
      setForm({ item: '', quantity: 1, priority: 'medium' });
      fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit need request');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout type="manager">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory & Needs</h2>
          <p className="text-gray-500 text-sm">Manage inventory stock levels and request new supplies</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left and Middle columns: Stock Levels and Needs History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Levels */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-lg">Current Stock Levels</h3>
            </div>
            
            {loading ? (
              <div className="py-8 text-center text-gray-400">Loading stock data...</div>
            ) : stockItems.length === 0 ? (
              <div className="py-8 text-center text-gray-400">No inventory items tracked yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 font-medium">
                      <th className="py-3">Item Name</th>
                      <th className="py-3">Category</th>
                      <th className="py-3 text-right">Current Stock</th>
                      <th className="py-3 text-right">Min Stock</th>
                      <th className="py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {stockItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 font-medium text-gray-900">{item.item}</td>
                        <td className="py-3 capitalize text-xs text-gray-500">{item.category}</td>
                        <td className="py-3 text-right font-medium">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="py-3 text-right text-gray-500">
                          {item.minimumStock} {item.unit}
                        </td>
                        <td className="py-3 text-right">
                          {item.isLowStock ? (
                            <span className="badge bg-red-50 text-red-700 border border-red-100 flex items-center gap-1 w-fit ml-auto text-xs font-semibold">
                              <AlertCircle className="w-3 h-3" /> Low Stock
                            </span>
                          ) : (
                            <span className="badge bg-green-50 text-green-700 border border-green-100 flex items-center gap-1 w-fit ml-auto text-xs font-semibold">
                              <CheckCircle className="w-3 h-3" /> Healthy
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Requested Needs History */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Requested Needs History</h3>
            </div>

            {loading ? (
              <div className="py-8 text-center text-gray-400">Loading requested needs...</div>
            ) : needs.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">No need requests submitted yet. Use the form on the right to request supplies.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 font-medium">
                      <th className="py-3">Requested Item</th>
                      <th className="py-3 text-right">Qty</th>
                      <th className="py-3 text-center">Priority</th>
                      <th className="py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {needs.map((need) => (
                      <tr key={need._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 font-medium text-gray-900">{need.item}</td>
                        <td className="py-3 text-right font-medium">{need.quantity}</td>
                        <td className="py-3 text-center capitalize">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            need.priority === 'high' ? 'bg-red-100 text-red-800' :
                            need.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {need.priority}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {need.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded">
                              <CheckCircle className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Request a Need Form */}
        <div>
          <div className="card sticky top-6">
            <h3 className="font-semibold text-lg mb-4">Request Supplies / Need</h3>
            <p className="text-xs text-gray-500 mb-4">
              Submit need requests to platform administrators. Once approved, the need will appear on your public home page for donors to view and fulfill.
            </p>

            <form onSubmit={handleRequestNeed} className="space-y-4">
              {successMsg && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-medium">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Item Requested</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rice bags, Baby formula, Cough syrup"
                  className="input-field"
                  value={form.item}
                  onChange={(e) => setForm((prev) => ({ ...prev, item: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="input-field"
                    value={form.quantity}
                    onChange={(e) => setForm((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Priority</label>
                  <select
                    className="input-field"
                    value={form.priority}
                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {saving ? 'Submitting...' : (
                  <>
                    <Plus className="w-4 h-4" /> Request Need
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
