import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Receipt, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import Card from '../components/Card';
import { supabase } from '../lib/supabase';

interface KPIData {
  totalSales: number;
  totalStoreValue: number;
  totalExpenses: number;
  netProfit: number;
  salesChange: number;
  storeValueChange: number;
  expensesChange: number;
  profitChange: number;
}

export default function Dashboard() {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalSales: 0,
    totalStoreValue: 0,
    totalExpenses: 0,
    netProfit: 0,
    salesChange: 0,
    storeValueChange: 0,
    expensesChange: 0,
    profitChange: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKPIData();
  }, []);

  const loadKPIData = async () => {
    try {
      const { data: sales } = await supabase
        .from('sales')
        .select('amount');

      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount');

      const { data: storeValues } = await supabase
        .from('store_values')
        .select('goods_value, cash_value');

      const totalSales = sales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const totalStoreValue = storeValues?.reduce(
        (sum, sv) => sum + Number(sv.goods_value) + Number(sv.cash_value),
        0
      ) || 0;
      const netProfit = totalSales - totalExpenses;

      setKpiData({
        totalSales,
        totalStoreValue,
        totalExpenses,
        netProfit,
        salesChange: 5.2,
        storeValueChange: 2.8,
        expensesChange: -1.5,
        profitChange: 8.3,
      });
    } catch (error) {
      console.error('Error loading KPI data:', error);
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

  const kpiCards = [
    {
      title: 'Total Sales',
      value: kpiData.totalSales,
      change: kpiData.salesChange,
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'Total Store Value',
      value: kpiData.totalStoreValue,
      change: kpiData.storeValueChange,
      icon: Package,
      color: 'green',
    },
    {
      title: 'Total Expenses',
      value: kpiData.totalExpenses,
      change: kpiData.expensesChange,
      icon: Receipt,
      color: 'red',
    },
    {
      title: 'Net Profit',
      value: kpiData.netProfit,
      change: kpiData.profitChange,
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; text: string }> = {
      blue: { bg: 'bg-blue-50', icon: 'text-blue-500', text: 'text-blue-600' },
      green: { bg: 'bg-green-50', icon: 'text-green-500', text: 'text-green-600' },
      red: { bg: 'bg-red-50', icon: 'text-red-500', text: 'text-red-600' },
      purple: { bg: 'bg-violet-50', icon: 'text-violet-500', text: 'text-violet-600' },
    };
    return colors[color];
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your shop performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => {
          const colors = getColorClasses(card.color);
          const isPositive = card.change >= 0;

          return (
            <Card key={card.title} className="hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                  <card.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(card.change)}%</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(card.value)}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <p className="text-slate-500 text-sm">No recent activity to display.</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/sales"
              className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-600 font-medium transition-colors"
            >
              Record New Sale
            </a>
            <a
              href="/expenses"
              className="block p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 font-medium transition-colors"
            >
              Add Expense
            </a>
            <a
              href="/reports"
              className="block p-3 bg-green-50 hover:bg-green-100 rounded-xl text-green-600 font-medium transition-colors"
            >
              View Reports
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
