import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Car, Search, Plus, Trash2, User, Phone, Hash, Loader2, X } from 'lucide-react';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCar, setNewCar] = useState({ PlateNumber: '', DriverName: '', phoneNumber: '' });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await api.get('/cars/getAllCars');
      setCars(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cars/addCar', newCar);
      setShowModal(false);
      setNewCar({ PlateNumber: '', DriverName: '', phoneNumber: '' });
      fetchCars();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding car');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this car from records?')) return;
    try {
      await api.delete(`/cars/deleteCar/${id}`);
      fetchCars();
    } catch (err) {
      alert('Error deleting car');
    }
  };

  const filteredCars = cars.filter(car => 
    car.PlateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.DriverName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Car Inventory</h1>
          <p className="text-slate-500 text-sm">Registered vehicles in the SmartPark system.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Register Vehicle</span>
        </button>
      </div>

      <div className="card p-2 flex items-center gap-3">
        <div className="pl-3 text-slate-400">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Search by plate or driver..." 
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 py-2.5 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-sm font-bold uppercase tracking-widest">Loading Records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.length === 0 ? (
            <div className="col-span-full card p-20 text-center text-slate-400">
              <Car size={48} className="mx-auto mb-4 opacity-20" />
              <p>No vehicles found matching your search.</p>
            </div>
          ) : filteredCars.map((car) => (
            <div key={car._id} className="card p-6 hover:border-indigo-400 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                  <Car size={20} />
                </div>
                <span className="text-sm font-mono font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded border border-indigo-100">
                  {car.PlateNumber}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{car.DriverName}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-2">
                <Phone size={12} className="text-slate-400" /> {car.phoneNumber}
              </p>
              
              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                <button 
                  onClick={() => handleDelete(car._id)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-2"
                  title="Remove Car"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Vehicle Registration</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plate Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    className="input-field pl-10"
                    placeholder="e.g. RAA 000 A"
                    value={newCar.PlateNumber}
                    onChange={(e) => setNewCar({...newCar, PlateNumber: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Driver Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    className="input-field pl-10"
                    placeholder="Full name"
                    value={newCar.DriverName}
                    onChange={(e) => setNewCar({...newCar, DriverName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    className="input-field pl-10"
                    placeholder="07XXXXXXXX"
                    value={newCar.phoneNumber}
                    onChange={(e) => setNewCar({...newCar, phoneNumber: e.target.value})}
                  />
                </div>
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cars;

