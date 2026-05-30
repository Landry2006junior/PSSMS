import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LogIn, LogOut, Search, Trash2, Loader2, Clock, X, Car as CarIcon, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const ParkingRecords = () => {
  const [records, setRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);
  
  const [entryData, setEntryData] = useState({ plateNumber: '', SlotNumber: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, carsRes, slotsRes] = await Promise.all([
        api.get('/parkingrecords/getAllRecords'),
        api.get('/cars/getAllCars'),
        api.get('/parkingslots/getAvailableSlots')
      ]);
      setRecords(Array.isArray(recordsRes.data) ? recordsRes.data : []);
      setCars(Array.isArray(carsRes.data) ? carsRes.data : []);
      setSlots(Array.isArray(slotsRes.data) ? slotsRes.data : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateLiveFee = (entryTime) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const durationMinutes = Math.max(0, Math.floor((now - entry) / (1000 * 60)));
    const durationHours = Math.ceil(durationMinutes / 60) || 1;
    
    let rate = 500;
    if (durationHours > 1) rate = 1000;
    
    return {
      amount: durationHours * rate,
      isExceeded: durationHours > 1,
      duration: durationHours
    };
  };

  const handleEntry = async (e) => {
    e.preventDefault();
    try {
      await api.post('/parkingrecords/recordEntry', entryData);
      setShowEntryModal(false);
      setEntryData({ plateNumber: '', SlotNumber: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording entry');
    }
  };

  const handleExit = async (recordId) => {
    if (!window.confirm('Process exit for this vehicle?')) return;
    try {
      await api.post(`/parkingrecords/recordExit/${recordId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording exit');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record? Associated payments will also be removed.')) return;
    try {
      await api.delete(`/parkingrecords/deleterecord/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting record');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Logs</h1>
          <p className="text-slate-500 text-sm">Real-time tracking of vehicle entry and exit sessions.</p>
          <div className="mt-2 inline-flex items-center gap-4 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-indigo-900 uppercase">Standard: 500 Rwf/hr</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-tight">Overtime ({'>'}1h): 1,000 Rwf/hr</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowEntryModal(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <LogIn size={18} />
          <span>New Entry</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Moment</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exit Moment</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mb-2" size={24} />
                    <p className="text-xs font-bold uppercase tracking-widest">Updating Logs...</p>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-300">No active or past sessions found.</td>
                </tr>
              ) : records.map((record) => (
                <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                        <CarIcon size={16} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{record.plateNumber || record.carId?.plateNumber}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400">{record.Car?.DriverName || 'No Name'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-black">
                      <MapPin size={10} /> {record.SlotNumber || record.slotId?.slotNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-600">{record.Entrytime ? format(new Date(record.Entrytime), 'HH:mm') : '-'}</p>
                    <p className="text-[10px] text-slate-400">{record.Entrytime ? format(new Date(record.Entrytime), 'MMM d, yyyy') : ''}</p>
                  </td>
                  <td className="px-6 py-4">
                    {record.Exittime ? (
                      <div>
                        <p className="text-sm font-bold text-emerald-600">{format(new Date(record.Exittime), 'HH:mm')}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{record.duration}</p>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                         Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {record.Exittime ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">
                          {record.AmountPaid?.toLocaleString()} Rwf
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">
                            {record.hourlyRate || 500}/hr
                          </span>
                          {record.isExceeded && (
                            <span className="text-[9px] text-amber-600 font-black uppercase tracking-widest flex items-center gap-1">
                              <Clock size={8} /> Exceeded
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      (() => {
                        const live = calculateLiveFee(record.Entrytime);
                        return (
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-indigo-600 animate-pulse">
                              {live.amount.toLocaleString()} Rwf
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-slate-400 font-bold uppercase">
                                {live.isExceeded ? '1,000' : '500'}/hr
                              </span>
                              {live.isExceeded && (
                                <span className="text-[9px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1">
                                  <AlertCircle size={8} /> Exceeded
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {!record.Exittime && (
                        <button 
                          onClick={() => handleExit(record._id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                          title="Record Exit"
                        >
                          <LogOut size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(record._id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Record Entry</h3>
              <button onClick={() => setShowEntryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEntry} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Registered Vehicle</label>
                <select 
                  required
                  className="input-field"
                  value={entryData.plateNumber}
                  onChange={(e) => setEntryData({...entryData, plateNumber: e.target.value})}
                >
                  <option value="">-- Choose Plate Number --</option>
                  {cars.map(car => (
                    <option key={car._id} value={car.PlateNumber}>{car.PlateNumber} ({car.DriverName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Available Slot</label>
                <select 
                  required
                  className="input-field"
                  value={entryData.SlotNumber}
                  onChange={(e) => setEntryData({...entryData, SlotNumber: e.target.value})}
                >
                  <option value="">-- Choose Slot --</option>
                  {slots.map(slot => (
                    <option key={slot._id} value={slot.SlotNumber}>{slot.SlotNumber}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-primary text-sm font-bold"
                >
                  Confirm Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingRecords;
