import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SquareParking, Plus, Loader2, Info, CheckCircle2, AlertCircle, Trash2, X } from 'lucide-react';

const ParkingSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ SlotNumber: '' });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await api.get('/parkingslots/getAllSlots');
      setSlots(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/parkingslots/addSlot', newSlot);
      setShowModal(false);
      setNewSlot({ SlotNumber: '' });
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding slot');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this parking slot?')) return;
    try {
      await api.delete(`/parkingslots/deleteSlot/${id}`);
      fetchSlots();
    } catch (err) {
      alert('Error deleting slot');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Parking Map</h1>
          <p className="text-slate-500 text-sm">Physical infrastructure and slot availability status.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add Slot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-sm font-bold uppercase tracking-widest">Scanning Grid...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {slots.length === 0 ? (
                <div className="col-span-full card p-20 text-center text-slate-400 border-dashed">
                  <SquareParking size={48} className="mx-auto mb-4 opacity-10" />
                  <p>No parking slots have been configured yet.</p>
                </div>
              ) : slots.map((slot) => (
                <div 
                  key={slot._id} 
                  className={`
                    card relative p-6 flex flex-col items-center justify-center transition-all group
                    ${slot.SlotStatus === 'Available' 
                      ? 'border-emerald-200 bg-emerald-50/30' 
                      : 'border-slate-200 bg-slate-50 opacity-60'}
                  `}
                >
                  <SquareParking size={32} className={`mb-3 ${slot.SlotStatus === 'Available' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className={`text-xl font-black ${slot.SlotStatus === 'Available' ? 'text-emerald-900' : 'text-slate-600'}`}>{slot.SlotNumber}</span>
                  <span className={`text-[10px] font-black uppercase tracking-tighter mt-1 ${slot.SlotStatus === 'Available' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {slot.SlotStatus}
                  </span>
                  
                  <button 
                    onClick={() => handleDelete(slot._id)}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Slot"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info size={16} className="text-indigo-600" /> Status Guide
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200"></div>
                <span className="text-sm font-bold text-slate-600">Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                <span className="text-sm font-bold text-slate-400">Occupied</span>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Capacity</p>
               <p className="text-3xl font-black text-slate-900">{slots.length}</p>
            </div>
          </div>
        </div>
      </div>

       {/* Modal */}
       {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">New Parking Slot</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSlot} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Slot ID (e.g. A1, B12)</label>
                <input 
                  required
                  className="input-field"
                  placeholder="Enter slot number"
                  value={newSlot.SlotNumber}
                  onChange={(e) => setNewSlot({...newSlot, SlotNumber: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-primary text-sm font-bold"
                >
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSlots;

