import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Car, 
  ParkingCircle, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      {loading ? (
        <Loader2 className="animate-spin text-slate-300 mt-2" size={20} />
      ) : (
        <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    activeRecords: 0,
    availableSlots: 0,
    todayRevenue: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [carsRes, recordsRes, slotsRes, paymentsRes] = await Promise.all([
        api.get('/cars/getAllCars'),
        api.get('/parkingrecords/getAllRecords'),
        api.get('/parkingslots/getAllSlots'),
        api.get('/payments/getAllPayments')
      ]);

      const records = Array.isArray(recordsRes.data) ? recordsRes.data : [];
      const slots = Array.isArray(slotsRes.data) ? slotsRes.data : [];
      const cars = Array.isArray(carsRes.data) ? carsRes.data : [];
      const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

      // Calculate stats
      const activeRecords = records.filter(r => !r.Exittime && !r.exittime).length; 
      const availableSlots = slots.filter(s => s.SlotStatus === 'Available' || s.status === 'Available').length;
      
      // Calculate today's revenue from payments
      const today = new Date().toISOString().split('T')[0];
      const todayRevenue = payments
        .filter(p => p.paymentDate && p.paymentDate.startsWith(today))
        .reduce((sum, p) => sum + (p.Amount || p.AmountPaid || 0), 0);

      setStats({
        totalCars: cars.length,
        totalSlots: slots.length,
        activeRecords,
        availableSlots,
        todayRevenue
      });

      setActivities(records.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Dashboard</h1>
        <p className="text-slate-500 text-sm">Real-time overview of Rubavu parking operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Registered Vehicles" 
          value={stats.totalCars} 
          icon={Car} 
          color="bg-indigo-600"
          loading={loading}
        />
        <StatCard 
          title="Active Stays" 
          value={stats.activeRecords} 
          icon={Clock} 
          color="bg-amber-500"
          loading={loading}
        />
        <StatCard 
          title="Available Slots" 
          value={stats.availableSlots} 
          icon={ParkingCircle} 
          color="bg-emerald-500"
          loading={loading}
        />
        <StatCard 
          title="Today's Revenue" 
          value={`${stats.todayRevenue.toLocaleString()} Rwf`} 
          icon={TrendingUp} 
          color="bg-blue-600"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Recent Activity</h3>
            <button className="text-indigo-600 hover:text-indigo-700 text-xs font-bold uppercase tracking-wider">Live Log</button>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-10 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2" /> Loading...</div>
            ) : activities.length === 0 ? (
              <div className="p-10 text-center text-slate-400">No recent activity</div>
            ) : activities.map((activity, i) => (
              <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.exittime || activity.exitTime ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Car size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    {activity.plateNumber || activity.carId?.plateNumber} {activity.exittime || activity.exitTime ? 'Departed' : 'Arrived'}
                  </p>
                  <p className="text-xs text-slate-500">Slot {activity.SlotNumber || activity.slotId?.slotNumber}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${activity.exittime || activity.exitTime ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                    {activity.exittime || activity.exitTime ? 'Exit' : 'Entry'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
            <TrendingUp size={32} />
          </div>
          <h3 className="font-bold text-slate-900">Capacity Monitor</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">Current occupancy across all sections.</p>
          
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-indigo-600 h-full transition-all duration-1000" 
              style={{ width: `${stats.totalSlots > 0 ? Math.round(((stats.totalSlots - stats.availableSlots) / stats.totalSlots) * 100) : 0}%` }}
            ></div>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {stats.totalSlots > 0 ? Math.round(((stats.totalSlots - stats.availableSlots) / stats.totalSlots) * 100) : 0}% Occupied
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

