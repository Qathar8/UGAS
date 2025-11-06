import { useState } from 'react';
import { Settings as SettingsIcon, User, DollarSign, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('MZN');
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to reset all demo data? This action cannot be undone.')) {
      return;
    }

    setIsResetting(true);

    try {
      await Promise.all([
        supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('store_values').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('shops').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      ]);

      alert('All data has been reset successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Failed to reset data. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your application preferences</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Owner Information</h2>
              <p className="text-sm text-slate-500">Your account details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={user?.name || ''}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                disabled
              />
            </div>

            <p className="text-xs text-slate-500">
              This is a demo account. Contact support to update your information.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Currency</h2>
              <p className="text-sm text-slate-500">Display currency for all amounts</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MZN">MZN - Mozambique Metical</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
            <p className="text-xs text-slate-500 mt-2">
              Currently set to: <strong>MZN (Mozambique Metical)</strong>
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 p-3 rounded-xl">
              <RefreshCw className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Reset Demo Data</h2>
              <p className="text-sm text-slate-500">Clear all data and start fresh</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This will permanently delete all shops, sales, expenses, and
              store values. This action cannot be undone.
            </p>
          </div>

          <Button
            variant="danger"
            onClick={handleResetData}
            disabled={isResetting}
            className="w-full"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'Resetting Data...' : 'Reset All Data'}
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-100 p-3 rounded-xl">
              <SettingsIcon className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">About</h2>
              <p className="text-sm text-slate-500">Application information</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Version</span>
              <span className="font-medium text-slate-800">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Application</span>
              <span className="font-medium text-slate-800">Shop Tracker Pro</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Type</span>
              <span className="font-medium text-slate-800">MVP Demo</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
