import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../components/Card';
import { supabase } from '../lib/supabase';

interface ShopPerformance {
  shop_name: string;
  sales: number;
  expenses: number;
  profit: number;
}

interface DailySales {
  date: string;
  amount: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
}

export default function Reports() {
  const [shopPerformance, setShopPerformance] = useState<ShopPerformance[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const [shopsResult, salesResult, expensesResult] = await Promise.all([
        supabase.from('shops').select('id, name'),
        supabase.from('sales').select('shop_id, amount, date'),
        supabase.from('expenses').select('category, amount, date'),
      ]);

      if (shopsResult.data && salesResult.data) {
        const performance = shopsResult.data.map(shop => {
          const shopSales = salesResult.data
            .filter(s => s.shop_id === shop.id)
            .reduce((sum, s) => sum + Number(s.amount), 0);

          return {
            shop_name: shop.name,
            sales: shopSales,
            expenses: 0,
            profit: shopSales,
          };
        });
        setShopPerformance(performance);
      }

      if (salesResult.data) {
        const salesByDate = salesResult.data.reduce((acc, sale) => {
          const date = sale.date;
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += Number(sale.amount);
          return acc;
        }, {} as Record<string, number>);

        const sortedDailySales = Object.entries(salesByDate)
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-14);

        setDailySales(sortedDailySales);
      }

      if (expensesResult.data) {
        const expensesByCategory = expensesResult.data.reduce((acc, expense) => {
          const category = expense.category;
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += Number(expense.amount);
          return acc;
        }, {} as Record<string, number>);

        const categoryData = Object.entries(expensesByCategory)
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount);

        setExpensesByCategory(categoryData);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Visualize your business performance</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Daily Sales Trend</h2>
            {dailySales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('pt-MZ', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('pt-MZ')}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    name="Sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-400">
                No sales data available
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Expenses by Category</h2>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.category}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expensesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-400">
                No expense data available
              </div>
            )}
          </Card>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Shop Performance</h2>
          {shopPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={shopPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="shop_name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="sales" fill="#3B82F6" name="Sales" radius={[8, 8, 0, 0]} />
                <Bar dataKey="profit" fill="#10B981" name="Profit" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-400">
              No shop performance data available
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Shop Performance Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Shop Name
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                    Sales
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                    Expenses
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody>
                {shopPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  shopPerformance.map((shop) => (
                    <tr key={shop.shop_name} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 font-medium text-slate-800">{shop.shop_name}</td>
                      <td className="py-4 px-4 text-right text-blue-600 font-semibold">
                        {formatCurrency(shop.sales)}
                      </td>
                      <td className="py-4 px-4 text-right text-red-600 font-semibold">
                        {formatCurrency(shop.expenses)}
                      </td>
                      <td className="py-4 px-4 text-right text-green-600 font-bold">
                        {formatCurrency(shop.profit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
