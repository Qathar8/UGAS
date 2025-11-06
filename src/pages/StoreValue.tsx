import { useState, useEffect, FormEvent } from 'react';
import { Package, Edit, Download } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';
import type { StoreValue, Shop } from '../lib/database.types';
import * as XLSX from 'xlsx';

interface StoreValueWithShop extends StoreValue {
  shop_name?: string;
}

export default function StoreValuePage() {
  const [storeValues, setStoreValues] = useState<StoreValueWithShop[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<StoreValue | null>(null);
  const [formData, setFormData] = useState({
    shop_id: '',
    goods_value: '',
    cash_value: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [valuesResult, shopsResult] = await Promise.all([
        supabase.from('store_values').select('*'),
        supabase.from('shops').select('*'),
      ]);

      if (valuesResult.error) throw valuesResult.error;
      if (shopsResult.error) throw shopsResult.error;

      const shopsMap = new Map(shopsResult.data?.map(s => [s.id, s.name]));
      const valuesWithShops = valuesResult.data?.map(value => ({
        ...value,
        shop_name: shopsMap.get(value.shop_id),
      })) || [];

      setStoreValues(valuesWithShops);
      setShops(shopsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const valueData = {
        shop_id: formData.shop_id,
        goods_value: parseFloat(formData.goods_value),
        cash_value: parseFloat(formData.cash_value),
        updated_at: new Date().toISOString(),
      };

      if (editingValue) {
        const { error } = await supabase
          .from('store_values')
          .update(valueData)
          .eq('id', editingValue.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('store_values')
          .insert([valueData]);

        if (error) throw error;
      }

      closeModal();
      loadData();
    } catch (error) {
      console.error('Error saving store value:', error);
      alert('Failed to save store value. Please try again.');
    }
  };

  const handleEdit = (value: StoreValue) => {
    setEditingValue(value);
    setFormData({
      shop_id: value.shop_id,
      goods_value: value.goods_value.toString(),
      cash_value: value.cash_value.toString(),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingValue(null);
    setFormData({
      shop_id: '',
      goods_value: '',
      cash_value: '',
    });
  };

  const exportToExcel = () => {
    const exportData = storeValues.map(value => ({
      Shop: value.shop_name,
      'Goods Value (MZN)': value.goods_value,
      'Cash Value (MZN)': value.cash_value,
      'Total Value (MZN)': Number(value.goods_value) + Number(value.cash_value),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Store Values');

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `shop_tracker_store_values_${date}.xlsx`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalValue = storeValues.reduce(
    (sum, value) => sum + Number(value.goods_value) + Number(value.cash_value),
    0
  );

  const availableShops = shops.filter(
    shop => !storeValues.some(sv => sv.shop_id === shop.id) || editingValue?.shop_id === shop.id
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Store Value</h1>
          <p className="text-slate-500 mt-1">Track goods and cash inventory</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportToExcel}>
            <Download className="w-5 h-5 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => setIsModalOpen(true)} disabled={availableShops.length === 0}>
            <Edit className="w-5 h-5 mr-2" />
            Update Values
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Store Value</p>
              <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
            <Package className="w-12 h-12 text-green-200" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Shop</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                  Goods Value
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                  Cash Value
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                  Total Value
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {storeValues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No store values recorded yet. Click "Update Values" to get started.
                  </td>
                </tr>
              ) : (
                storeValues.map((value) => {
                  const total = Number(value.goods_value) + Number(value.cash_value);
                  return (
                    <tr key={value.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Package className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="font-medium text-slate-800">{value.shop_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-800">
                        {formatCurrency(Number(value.goods_value))}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-800">
                        {formatCurrency(Number(value.cash_value))}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-green-600">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(value)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingValue ? 'Update Store Value' : 'Add Store Value'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Shop</label>
            <select
              value={formData.shop_id}
              onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!!editingValue}
            >
              <option value="">Select a shop</option>
              {availableShops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Goods Value (MZN)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.goods_value}
              onChange={(e) => setFormData({ ...formData, goods_value: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cash Value (MZN)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.cash_value}
              onChange={(e) => setFormData({ ...formData, cash_value: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingValue ? 'Update Value' : 'Add Value'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
