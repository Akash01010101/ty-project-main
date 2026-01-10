import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Eye, EyeOff, Upload, X, ArrowRight, ArrowLeft, 
  User, Mail, Lock, GraduationCap, Briefcase, 
  Sparkles, FileText, CheckCircle2, Camera, Plus, Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const SignUpPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    skills: '',
    experience: [],
    education: [],
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [resume, setResume] = useState(null);
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();

  const { name, email, password, university, skills, experience, education } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
    if (localError) setLocalError('');
  };

  const handleFileChange = useCallback((e) => {
    if (e.target.name === 'profilePicture') {
      const file = e.target.files[0];
      setProfilePicture(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setProfilePreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else if (e.target.name === 'resume') {
      setResume(e.target.files[0]);
    }
  }, []);

  // Experience Handlers
  const handleExperienceChange = (index, e) => {
    const newExperience = [...experience];
    newExperience[index][e.target.name] = e.target.value;
    setFormData({ ...formData, experience: newExperience });
  };

  const addExperienceField = () => {
    setFormData({
      ...formData,
      experience: [...experience, { title: '', company: '', from: '', to: '', current: false, description: '' }]
    });
  };

  const removeExperienceField = (index) => {
    setFormData({ ...formData, experience: experience.filter((_, i) => i !== index) });
  };

  // Education Handlers
  const handleEducationChange = (index, e) => {
    const newEducation = [...education];
    newEducation[index][e.target.name] = e.target.value;
    setFormData({ ...formData, education: newEducation });
  };

  const addEducationField = () => {
    setFormData({
      ...formData,
      education: [...education, { school: '', degree: '', fieldofstudy: '', from: '', to: '', current: false, description: '' }]
    });
  };

  const removeEducationField = (index) => {
    setFormData({ ...formData, education: education.filter((_, i) => i !== index) });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return setLocalError('Password must be at least 6 characters');

    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('password', password);
    data.append('university', university || 'State University');
    data.append('skills', skills);
    data.append('experience', JSON.stringify(experience));
    data.append('education', JSON.stringify(education));
    if (profilePicture) data.append('profilePicture', profilePicture);
    if (resume) data.append('resume', resume);
    
    try {
      await register(data);
      navigate('/dashboard');
    } catch (error) {
      setLocalError(error.message || 'Registration failed');
    }
  };

  const nextStep = () => {
    if (step === 1 && (!name || !email || !password)) return setLocalError('Please fill in required fields');
    setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  const steps = [
    { id: 1, title: 'Basic Info', icon: User, desc: 'Your account details' },
    { id: 2, title: 'Experience', icon: Briefcase, desc: 'Your work history' },
    { id: 3, title: 'Details', icon: Sparkles, desc: 'Skills & Education' },
  ];

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#0a0e1a', fontFamily: 'Circular, sans-serif' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <span className="text-white font-bold text-2xl">🍀</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Peerly</h1>
          </Link>
          <p className="text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-emerald-500 font-semibold hover:underline">Log in</Link>
          </p>
        </div>

        {localError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl border border-red-900/30 bg-red-900/10 text-red-400 text-sm">
            {localError}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT PANEL - PROGRESS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h2 className="text-xl font-bold text-white mb-8">Create Account</h2>
              <div className="space-y-8">
                {steps.map((s) => (
                  <div key={s.id} className="flex items-start gap-4">
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${step >= s.id ? 'shadow-lg' : ''}`}
                      style={{ 
                        background: step >= s.id ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#2d3548',
                        color: step >= s.id ? 'white' : '#94a3b8'
                      }}
                    >
                      {step > s.id ? <CheckCircle2 size={20} /> : <s.icon size={20} />}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${step >= s.id ? 'text-white' : 'text-gray-500'}`}>{s.title}</p>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profile Preview in Sidebar */}
              {step > 1 && (
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/20 mb-4 bg-[#2d3548] flex items-center justify-center">
                    {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" /> : <User size={40} className="text-gray-600" />}
                  </div>
                  <p className="text-white font-medium">{name || 'Your Name'}</p>
                  <p className="text-xs text-gray-500">{university || 'Your University'}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL - FORM */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl p-8 shadow-lg"
              style={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <form onSubmit={onSubmit}>
                {/* STEP 1: BASIC INFO */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">Step 1: Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input type="text" name="name" value={name} onChange={onChange} placeholder="John Doe" className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#2d3548] border-none text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">University</label>
                        <div className="relative">
                          <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input type="text" name="university" value={university} onChange={onChange} placeholder="State University" className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#2d3548] border-none text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="email" name="email" value={email} onChange={onChange} placeholder="john@university.edu" className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#2d3548] border-none text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type={showPassword ? "text" : "password"} name="password" value={password} onChange={onChange} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#2d3548] border-none text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: EXPERIENCE */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">Step 2: Experience</h3>
                    <div className="space-y-4">
                      {experience.map((exp, index) => (
                        <div key={index} className="p-5 rounded-2xl bg-[#2d3548] relative border border-white/5 group">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input type="text" name="title" value={exp.title} onChange={(e) => handleExperienceChange(index, e)} placeholder="Job Title" className="w-full px-4 py-2.5 rounded-xl bg-[#1a1f2e] border-none text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                            <input type="text" name="company" value={exp.company} onChange={(e) => handleExperienceChange(index, e)} placeholder="Company" className="w-full px-4 py-2.5 rounded-xl bg-[#1a1f2e] border-none text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <input type="date" name="from" value={exp.from} onChange={(e) => handleExperienceChange(index, e)} className="w-full px-4 py-2.5 rounded-xl bg-[#1a1f2e] border-none text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500" />
                            <input type="date" name="to" value={exp.to} onChange={(e) => handleExperienceChange(index, e)} className="w-full px-4 py-2.5 rounded-xl bg-[#1a1f2e] border-none text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500" />
                          </div>
                          <textarea name="description" value={exp.description} onChange={(e) => handleExperienceChange(index, e)} placeholder="What did you do?" rows={2} className="w-full px-4 py-2.5 rounded-xl bg-[#1a1f2e] border-none text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                          <button type="button" onClick={() => removeExperienceField(index)} className="absolute top-4 right-4 text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addExperienceField} className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                      <Plus size={18} /> Add Experience
                    </button>
                  </div>
                )}

                {/* STEP 3: SKILLS & EDUCATION */}
                {step === 3 && (
                  <div className="space-y-8">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">Step 3: Final Details</h3>
                    
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-[#2d3548] border-2 border-emerald-500/30 flex items-center justify-center">
                          {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" /> : <Camera size={32} className="text-gray-500" />}
                        </div>
                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                          <Upload size={14} className="text-white" />
                          <input type="file" name="profilePicture" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">Upload a profile picture</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Skills (comma separated)</label>
                      <input type="text" name="skills" value={skills} onChange={onChange} placeholder="React, UI Design, Marketing..." className="w-full px-4 py-3 rounded-xl bg-[#2d3548] border-none text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>

                    {/* Resume Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Resume (PDF)</label>
                      <label className="block w-full cursor-pointer">
                        <div className="w-full py-6 rounded-xl border-2 border-dashed border-white/10 bg-[#2d3548]/50 flex flex-col items-center justify-center gap-2 hover:border-emerald-500/50 transition-colors">
                          <FileText size={24} className="text-gray-500" />
                          <span className="text-sm text-gray-400">{resume ? resume.name : 'Upload PDF Resume'}</span>
                          <input type="file" name="resume" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                        </div>
                      </label>
                    </div>

                    {/* Education Array */}
                    <div className="space-y-4 pt-4">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Education History</p>
                      {education.map((edu, index) => (
                        <div key={index} className="p-5 rounded-2xl bg-[#2d3548] relative border border-white/5 group">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="school" value={edu.school} onChange={(e) => handleEducationChange(index, e)} placeholder="School/College" className="w-full px-4 py-2.5 rounded-xl bg-[#1a1f2e] border-none text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                            <input type="text" name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} placeholder="Degree" className="w-full px-4 py-2.5 rounded-xl bg-[#1a1f2e] border-none text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                          </div>
                          <button type="button" onClick={() => removeEducationField(index)} className="absolute top-4 right-4 text-red-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={addEducationField} className="w-full py-3 rounded-xl border border-white/5 bg-[#2d3548]/30 text-gray-400 hover:text-white transition-all text-sm">
                        + Add Education
                      </button>
                    </div>
                  </div>
                )}

                {/* NAVIGATION BUTTONS */}
                <div className="mt-10 pt-6 border-t border-white/5 flex gap-4">
                  {step > 1 && (
                    <button type="button" onClick={prevStep} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-[#2d3548] text-white hover:bg-[#3f495e]">
                      <ArrowLeft size={18} /> Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button type="button" onClick={nextStep} className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                      Continue <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                      {isLoading ? "Creating Account..." : "Complete Sign Up"}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;