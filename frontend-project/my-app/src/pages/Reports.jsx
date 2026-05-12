import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, TrendingUp, Users, Calendar, Download, Loader2, FileText } from 'lucide-react';
import { format } from 'date-fns';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await api.get('/payments/getDailyReport');
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRevenue = () => {
    if (!reportData?.report) return 0;
    return reportData.report.reduce((sum, item) => sum + item.AmountPaid, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Analytics</h1>
          <p className="text-slate-500 text-sm">Operational reporting for {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        {/* Export PDF removed as per request */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-indigo-400" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today's Revenue</p>
          </div>
          <p className="text-3xl font-black">{calculateTotalRevenue().toLocaleString()} <span className="text-sm font-normal text-slate-400">Rwf</span></p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
              <Calendar size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Sessions</p>
          </div>
          <p className="text-3xl font-black text-slate-900">{reportData?.total || 0}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
              <Users size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unique Vehicles</p>
          </div>
          <p className="text-3xl font-black text-slate-900">{new Set(reportData?.report?.map(r => r.plateNumber)).size || 0}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
            <FileText size={16} className="text-indigo-600" /> Session Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plate Number</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stay Duration</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mb-2" size={24} />
                    <p className="text-xs font-bold uppercase tracking-widest">Compiling Report...</p>
                  </td>
                </tr>
              ) : !reportData?.report || reportData.report.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-300 font-bold italic">No data recorded for this period.</td>
                </tr>
              ) : reportData.report.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-black text-slate-900">{row.plateNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-600">{row.duration}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-indigo-600">{row.AmountPaid.toLocaleString()} Rwf</span>
                      {row.AmountPaid > 500 && (
                        <span className="text-[9px] font-black uppercase text-red-500 tracking-tighter">Overtime</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
