import { useState, useEffect, FormEvent } from 'react';
import { ShoppingCart, Edit, Trash2, Plus, Download } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';
import type { Sale, Shop } from '../lib/database.types';
import * as XLSX from 'xlsx';

interface SaleWithShop extends Sale {
  shop_name?: string;
}

export default function Sales() {
  const [sales, setSales] = useState<SaleWithShop[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shop_id: '',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [salesResult, shopsResult] = await Promise.all([
        supabase.from('sales').select('*').order('date', { ascending: false }),
        supabase.from('shops').select('*'),
      ]);

      if (salesResult.error) throw salesResult.error;
      if (shopsResult.error) throw shopsResult.error;

      const shopsMap = new Map(shopsResult.data?.map(s => [s.id, s.name]));
      const salesWithShops = salesResult.data?.map(sale => ({
        ...sale,
        shop_name: shopsMap.get(sale.shop_id),
      })) || [];

      setSales(salesWithShops);
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
      const saleData = {
        date: formData.date,
        shop_id: formData.shop_id,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
      };

      if (editingSale) {
        const { error } = await supabase
          .from('sales')
          .update({ ...saleData, updated_at: new Date().toISOString() })
          .eq('id', editingSale.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sales')
          .insert([saleData]);

        if (error) throw error;
      }

      closeModal();
      loadData();
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Failed to save sale. Please try again.');
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      date: sale.date,
      shop_id: sale.shop_id,
      amount: sale.amount.toString(),
      notes: sale.notes,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Failed to delete sale. Please try again.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      shop_id: '',
      amount: '',
      notes: '',
    });
  };

  const exportToExcel = () => {
    const exportData = sales.map(sale => ({
      Date: sale.date,
      Shop: sale.shop_name,
      'Amount (MZN)': sale.amount,
      Notes: sale.notes,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales');

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `shop_tracker_sales_${date}.xlsx`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);

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
          <h1 className="text-3xl font-bold text-slate-800">Sales</h1>
          <p className="text-slate-500 mt-1">Record and manage daily sales</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportToExcel}>
            <Download className="w-5 h-5 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Sale
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Sales</p>
              <p className="text-3xl font-bold">{formatCurrency(totalSales)}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-blue-200" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Shop</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Notes</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No sales recorded yet. Click "Add Sale" to get started.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 text-slate-800">{sale.date}</td>
                    <td className="py-4 px-4 text-slate-600">{sale.shop_name}</td>
                    <td className="py-4 px-4 text-right font-semibold text-slate-800">
                      {formatCurrency(Number(sale.amount))}
                    </td>
                    <td className="py-4 px-4 text-slate-600">{sale.notes}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(sale)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSale ? 'Edit Sale' : 'Add New Sale'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Shop</label>
            <select
              value={formData.shop_id}
              onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a shop</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount (MZN)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingSale ? 'Update Sale' : 'Add Sale'}
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
