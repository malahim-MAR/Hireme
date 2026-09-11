import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Building2, User, Mail, Phone, FileText, Sparkles, Calendar } from 'lucide-react';

const NoteDetailPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    First_Name: '',
    Last_Name: '',
    Job_Title: '',
    Email: '',
    Phone: '',
    Company: '',
    Cover_Letter: '',
    Status: 'Applied',
    createdAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`http://localhost:5001/api/notes/${id}`);
        setFormData({
          First_Name: res.data.First_Name || '',
          Last_Name: res.data.Last_Name || '',
          Job_Title: res.data.Job_Title || '',
          Email: res.data.Email || '',
          Phone: res.data.Phone || '',
          Company: res.data.Company || '',
          Cover_Letter: res.data.Cover_Letter || '',
          Status: res.data.Status || 'Applied',
          createdAt: res.data.createdAt || null,
        });
      } catch (error) {
        console.error('Error fetching note details', error);
        toast.error('Failed to load application details.');
      } finally {
        setFetching(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`http://localhost:5001/api/notes/${id}`, formData);
      toast.success('Application details updated successfully');
      navigate('/');
    } catch (error) {
      console.error('Update error', error);
      toast.error('Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this application permanently?')) return;
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5001/api/notes/${id}`);
      toast.success('Application deleted');
      navigate('/');
    } catch (error) {
      console.error('Delete error', error);
      toast.error('Failed to delete application');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Top bar with Back and Delete */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Pipeline</span>
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Delete Application</span>
          </button>
        </div>

        {/* Edit Form Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 mb-2">
                <Sparkles size={12} />
                Application Editor
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
                {formData.First_Name} {formData.Last_Name}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {formData.Job_Title} at <span className="font-semibold text-slate-800">{formData.Company}</span>
              </p>
            </div>

            {formData.createdAt && (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-100/70 px-3 py-1.5 rounded-lg border border-slate-200">
                <Calendar size={13} />
                <span>Applied: {new Date(formData.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleEdit} className="p-6 md:p-8 space-y-6">
            {/* Section 1: Candidate Identity */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <User size={14} className="text-blue-600" />
                Applicant Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="First_Name"
                    value={formData.First_Name}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="Last_Name"
                    value={formData.Last_Name}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    name="Phone"
                    value={formData.Phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Role & Stage */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-600" />
                Target Role & Pipeline Status
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Job Title</label>
                  <input
                    type="text"
                    name="Job_Title"
                    value={formData.Job_Title}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    name="Company"
                    value={formData.Company}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Status Stage Selector */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pipeline Stage Status
                </label>
                <select
                  name="Status"
                  value={formData.Status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="Applied">● Applied (Submitted)</option>
                  <option value="Interview">● Interviewing (Active)</option>
                  <option value="Offer">● Offer Received</option>
                  <option value="Rejected">● Archived / Rejected</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Cover Letter */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <FileText size={14} className="text-blue-600" />
                Cover Letter & Interview Notes
              </h2>
              <textarea
                name="Cover_Letter"
                rows={6}
                value={formData.Cover_Letter}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Save Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>Saving Updates...</span>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Application Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoteDetailPage;
