import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Send, Sparkles, Building2, User, Mail, Phone, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const CreatePage = () => {
  const [formData, setFormData] = useState({
    First_Name: '',
    Last_Name: '',
    Job_Title: '',
    Email: '',
    Phone: '',
    Company: '',
    Cover_Letter: '',
    Status: 'Applied',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requiredFields = ['First_Name', 'Last_Name', 'Job_Title', 'Email', 'Company', 'Cover_Letter'];
    const isMissing = requiredFields.some((field) => !formData[field] || formData[field].trim() === '');

    if (isMissing) {
      toast.error('Please fill in all required fields (Name, Role, Company, Email, Cover Letter).');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5001/api/notes', formData);
      toast.success('Job application logged to your pipeline!');
      navigate('/');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit application. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Pipeline</span>
          </Link>
        </div>

        {/* Form Container Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 mb-2">
              <Sparkles size={12} />
              New Application
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
              Log Job Application
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Add details, candidate correspondence, and initial hiring stage to your tracker.
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Section 1: Candidate Identity */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <User size={14} className="text-blue-600" />
                Applicant Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="First_Name"
                    required
                    placeholder="e.g. Alex"
                    value={formData.First_Name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Last_Name"
                    required
                    placeholder="e.g. Morgan"
                    value={formData.Last_Name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="Email"
                    required
                    placeholder="alex.morgan@example.com"
                    value={formData.Email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="Phone"
                    placeholder="+1 (555) 019-2834"
                    value={formData.Phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Role & Opportunity */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-600" />
                Target Role & Company
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Job Title / Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Job_Title"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formData.Job_Title}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Company"
                    required
                    placeholder="e.g. Stripe, Airbnb, etc."
                    value={formData.Company}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Status Stage Selector */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Stage Status
                </label>
                <select
                  name="Status"
                  value={formData.Status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="Applied">● Applied (Submitted)</option>
                  <option value="Interview">● Interviewing (Screen / Technical / Onsite)</option>
                  <option value="Offer">● Offer Received</option>
                  <option value="Rejected">● Archived / Rejected</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Cover Letter & Pitch */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <FileText size={14} className="text-blue-600" />
                Cover Letter / Pitch Excerpt <span className="text-red-500">*</span>
              </h2>
              <textarea
                name="Cover_Letter"
                rows={5}
                required
                placeholder="Include your tailored elevator pitch, key achievements submitted with this application, or notes regarding referrals..."
                value={formData.Cover_Letter}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Logging to Pipeline...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Log Application to Pipeline</span>
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

export default CreatePage;
