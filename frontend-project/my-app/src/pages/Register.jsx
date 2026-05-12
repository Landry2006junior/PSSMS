import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Lock, User, Mail, AlertCircle, Phone, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    UserName: '',
    Email: '',
    Password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', formData);
      login(response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 px-4 py-12">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Create Account</h1>
          <p className="text-indigo-200">Join SmartPark Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center gap-3 text-rose-100 animate-shake">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-100 ml-1">Full Name</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-white transition-colors">
                <User size={18} />
              </span>
              <input
                type="text"
                name="UserName"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition-all font-medium"
                placeholder="John Doe"
                value={formData.UserName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-100 ml-1">Email Address</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-white transition-colors">
                <Mail size={18} />
              </span>
              <input
                type="email"
                name="Email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition-all font-medium"
                placeholder="manager@smartpark.com"
                value={formData.Email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-100 ml-1">Phone Number</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-white transition-colors">
                <Phone size={18} />
              </span>
              <input
                type="text"
                name="phone"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition-all font-medium"
                placeholder="+250 788 000 000 (Optional)"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-100 ml-1">Password</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-white transition-colors">
                <Lock size={18} />
              </span>
              <input
                type="password"
                name="Password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition-all font-medium"
                placeholder="••••••••"
                value={formData.Password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 h-14"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Register Account <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-indigo-200">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-bold hover:underline decoration-indigo-500 underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
