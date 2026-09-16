import { useState, useEffect } from 'react';
import { alertApi } from '../api/alertApi';
import { Bell, BellOff, Plus, Trash2 } from 'lucide-react';
import Button from '../components/common/Button';

const AlertSettings = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    locations: '',
    frequency: 'daily',
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await alertApi.getAlerts();
      setAlerts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        locations: formData.locations.split(',').map(l => l.trim()).filter(l => l),
        frequency: formData.frequency,
      };
      await alertApi.createAlert(payload);
      setShowForm(false);
      setFormData({ name: '', keywords: '', locations: '', frequency: 'daily' });
      fetchAlerts();
    } catch (err) {
      console.error('Failed to create alert', err);
    }
  };

  const handleToggle = async (id) => {
    try {
      await alertApi.toggleAlert(id);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to toggle alert', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await alertApi.deleteAlert(id);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to delete alert', err);
    }
  };

  if (loading) return <div className="p-8">Loading alerts...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Alerts</h1>
          <p className="mt-2 text-gray-600">Get notified when new jobs match your criteria.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold mb-4">New Alert</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Alert Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Remote React Jobs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Keywords (comma separated)</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.keywords}
                onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="e.g., React, Node, Frontend"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Locations (comma separated)</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.locations}
                onChange={e => setFormData({ ...formData, locations: e.target.value })}
                placeholder="e.g., Remote, New York, NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Frequency</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.frequency}
                onChange={e => setFormData({ ...formData, frequency: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="instant">Instant</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Save Alert</Button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {alerts.length === 0 && !showForm ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new job alert.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert._id} className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between ${!alert.isActive ? 'opacity-60' : ''}`}>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {alert.name}
                  {!alert.isActive && <span className="text-xs font-normal bg-gray-100 text-gray-600 px-2 py-1 rounded">Paused</span>}
                </h3>
                <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-2">
                  {alert.keywords?.length > 0 && <span><strong>Keywords:</strong> {alert.keywords.join(', ')}</span>}
                  {alert.locations?.length > 0 && <span><strong>Locations:</strong> {alert.locations.join(', ')}</span>}
                  <span><strong>Frequency:</strong> <span className="capitalize">{alert.frequency}</span></span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleToggle(alert._id)} title={alert.isActive ? "Pause Alert" : "Resume Alert"}>
                  {alert.isActive ? <BellOff className="w-5 h-5 text-gray-500" /> : <Bell className="w-5 h-5 text-green-600" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(alert._id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertSettings;
