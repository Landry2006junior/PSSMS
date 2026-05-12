import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Receipt, Printer, CreditCard, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments/getAllPayments');
      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Records</h1>
          <p className="text-slate-500 text-sm">Revenue tracking and digital receipt management.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (Rwf)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mb-2" size={24} />
                    <p className="text-xs font-bold uppercase tracking-widest">Fetching Ledger...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-300">No payment records found.</td>
                </tr>
              ) : payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-slate-400">#{payment._id.substring(0, 8).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-900">{payment.plateNumber}</p>
                    <p className="text-[10px] font-bold text-slate-400">Slot {payment.SlotNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">{payment.Amount?.toLocaleString()} Rwf</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        payment.PaymentStatus === 'Paid' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {payment.PaymentStatus}
                      </span>
                      {payment.Amount > 500 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                          Overtime
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedReceipt(payment)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100 inline-flex items-center gap-2"
                    >
                      <Receipt size={14} />
                      <span className="text-xs font-bold">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-full">
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <Receipt size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Digital Receipt</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SmartPark Rubavu Station</p>
              </div>

              <div className="border-y border-dashed border-slate-200 py-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Plate Number</span>
                  <span className="text-sm font-black text-slate-900">{selectedReceipt.plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Slot ID</span>
                  <span className="text-sm font-black text-slate-900">{selectedReceipt.SlotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Entry</span>
                  <span className="text-sm font-bold text-slate-600">{selectedReceipt.Entrytime ? format(new Date(selectedReceipt.Entrytime), 'MMM d, HH:mm') : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Exit</span>
                  <span className="text-sm font-bold text-slate-600">{selectedReceipt.Exittime ? format(new Date(selectedReceipt.Exittime), 'MMM d, HH:mm') : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rate</span>
                  <span className="text-sm font-bold text-slate-600">{selectedReceipt.Amount > 500 && (new Date(selectedReceipt.Exittime) - new Date(selectedReceipt.Entrytime)) > 3600000 ? '1,000' : '500'} Rwf/hr</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase">Total Amount</span>
                <span className="text-xl font-black text-indigo-600">{selectedReceipt.Amount?.toLocaleString()} Rwf</span>
              </div>

              <div className="flex gap-3 print:hidden">
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                >
                  Close
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                >
                  <Printer size={16} />
                  <span>Print</span>
                </button>
              </div>
            </div>
            <div className="bg-slate-900 py-4 text-center print:hidden">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                 <CreditCard size={10} /> Secure Transaction
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
