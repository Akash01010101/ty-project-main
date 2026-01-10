import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, User, Mail, Phone, Linkedin, MapPin, Lock, Eye, EyeOff,
  Plus, X, Facebook, Twitter, Instagram, GraduationCap, ArrowRight, ArrowLeft,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    headline: '',
    currentPosition: '',
    location: '',
    phone: '',
    linkedin: '',
    university: '',
    skills: [],
  });

  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const signupData = new FormData();
      signupData.append('name', formData.name);
      signupData.append('email', formData.email);
      signupData.append('password', formData.password);
      signupData.append('headline', formData.headline);
      signupData.append('currentPosition', formData.currentPosition);
      signupData.append('location', formData.location);
      signupData.append('phone', formData.phone);
      signupData.append('linkedin', formData.linkedin);
      signupData.append('university', formData.university);
      signupData.append('skills', JSON.stringify(formData.skills));
      
      if (profileImage) {
        signupData.append('profilePicture', profileImage);
      }

      await signup(signupData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const suggestedSkills = ['Figma', 'Sketch', 'Adobe XD', 'HTML/CSS', 'User Research', 'JavaScript', 'React', 'Python', 'Photoshop', 'Illustrator'];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <nav className="border-b" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <span className="text-white font-bold text-xl">🍀</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#1f2937' }}>Peerly</h1>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              to="/login" 
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#6b7280' }}
            >
              Already have an account? <span style={{ color: '#10b981' }}>Log in</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all shadow-sm ${
                      step >= s ? 'text-white' : ''
                    }`}
                    style={{ 
                      background: step >= s ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'white',
                      color: step >= s ? 'white' : '#9ca3af',
                      border: `2px solid ${step >= s ? '#10b981' : '#e5e7eb'}`
                    }}
                  >
                    {step > s ? <Check size={18} /> : s}
                  </div>
                  {s < 3 && (
                    <div 
                      className="w-20 h-0.5 mx-2 transition-all"
                      style={{ 
                        backgroundColor: step > s ? '#10b981' : '#e5e7eb' 
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-3 gap-24">
              <span className="text-xs font-medium" style={{ color: step >= 1 ? '#1f2937' : '#9ca3af' }}>Account</span>
              <span className="text-xs font-medium" style={{ color: step >= 2 ? '#1f2937' : '#9ca3af' }}>Profile</span>
              <span className="text-xs font-medium" style={{ color: step >= 3 ? '#1f2937' : '#9ca3af' }}>Skills</span>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md mx-auto mb-6 p-4 rounded-xl border shadow-sm"
                style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
              >
                <p className="text-sm text-red-600 text-center">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Account Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-md mx-auto"
                >
                  <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
                    <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: '#1f2937' }}>
                      Create your account
                    </h2>
                    <p className="text-sm mb-8 text-center" style={{ color: '#6b7280' }}>
                      Join the student freelance marketplace
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: '#6b7280' }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border transition-all"
                          style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: '#6b7280' }}>
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border transition-all"
                          style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: '#6b7280' }}>
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-12 border transition-all"
                            style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff size={18} style={{ color: '#9ca3af' }} />
                            ) : (
                              <Eye size={18} style={{ color: '#9ca3af' }} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: '#6b7280' }}>
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border transition-all"
                          style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full mt-8 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
                    >
                      Continue
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Profile Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  {/* Left Panel - Photo & Basic Info */}
                  <div className="lg:col-span-4">
                    <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
                      {/* Profile Photo */}
                      <div className="flex flex-col items-center mb-6">
                        <div className="relative mb-4">
                          <div 
                            className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center border-4"
                            style={{ 
                              backgroundColor: '#f3f4f6', 
                              borderColor: '#10b981' 
                            }}
                          >
                            {profileImagePreview ? (
                              <img
                                src={profileImagePreview}
                                alt="Profile Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Camera size={40} style={{ color: '#9ca3af' }} />
                            )}
                          </div>
                        </div>

                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <span 
                            className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 inline-block shadow-md"
                            style={{ 
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                            }}
                          >
                            Upload Photo
                          </span>
                        </label>
                      </div>

                      {/* Basic Fields */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Full Name</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Alex Morgan"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border transition-all"
                            style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Headline</label>
                          <input
                            type="text"
                            name="headline"
                            placeholder="Senior Product Designer"
                            value={formData.headline}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border transition-all"
                            style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Current Position</label>
                          <input
                            type="text"
                            name="currentPosition"
                            placeholder="UX Designer at TechCorp"
                            value={formData.currentPosition}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border transition-all"
                            style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Location</label>
                          <input
                            type="text"
                            name="location"
                            placeholder="San Francisco, CA"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border transition-all"
                            style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                          />
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="mt-6">
                        <h3 className="text-xs font-semibold mb-3" style={{ color: '#6b7280' }}>Contact Info</h3>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2">
                            <Mail size={16} style={{ color: '#9ca3af' }} />
                            <input
                              type="email"
                              name="email"
                              placeholder="Email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border"
                              style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={16} style={{ color: '#9ca3af' }} />
                            <input
                              type="tel"
                              name="phone"
                              placeholder="Phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border"
                              style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Linkedin size={16} style={{ color: '#9ca3af' }} />
                            <input
                              type="text"
                              name="linkedin"
                              placeholder="LinkedIn"
                              value={formData.linkedin}
                              onChange={handleInputChange}
                              className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border"
                              style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Social Icons */}
                      <div className="mt-6 flex justify-center gap-3">
                        {[
                          { Icon: Facebook, color: '#1877f2' },
                          { Icon: Twitter, color: '#1da1f2' },
                          { Icon: Linkedin, color: '#0a66c2' },
                          { Icon: Instagram, color: '#e4405f' }
                        ].map(({ Icon, color }, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80 shadow-sm"
                            style={{ backgroundColor: color }}
                          >
                            <Icon size={18} color="white" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - University */}
                  <div className="lg:col-span-8">
                    <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
                      <h2 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                        Education Details
                      </h2>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <GraduationCap size={20} style={{ color: '#10b981' }} />
                        <input
                          type="text"
                          name="university"
                          placeholder="University / College Name"
                          value={formData.university}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border transition-all"
                          style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                        />
                      </div>

                      <div 
                        className="p-8 rounded-xl text-center"
                        style={{ backgroundColor: '#f9fafb' }}
                      >
                        <GraduationCap size={48} className="mx-auto mb-4" style={{ color: '#d1d5db' }} />
                        <p className="text-sm" style={{ color: '#6b7280' }}>
                          Add your educational background to help clients understand your qualifications
                        </p>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-6">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                        style={{ 
                          backgroundColor: 'white', 
                          color: '#1f2937',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <ArrowLeft size={18} />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-md"
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
                      >
                        Continue
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Skills */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
                    <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: '#1f2937' }}>
                      What are your skills?
                    </h2>
                    <p className="text-sm mb-8 text-center" style={{ color: '#6b7280' }}>
                      Add skills to help clients find you for relevant projects
                    </p>

                    {/* Selected Skills */}
                    <div className="flex flex-wrap gap-2 mb-6 min-h-[80px] p-4 rounded-xl" style={{ backgroundColor: '#f9fafb' }}>
                      {formData.skills.length === 0 ? (
                        <p className="text-sm w-full text-center my-auto" style={{ color: '#9ca3af' }}>
                          No skills added yet. Click on suggested skills or add your own.
                        </p>
                      ) : (
                        formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
                            style={{ 
                              backgroundColor: '#1f2937',
                              color: 'white' 
                            }}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="hover:opacity-70 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Add Skill Input */}
                    <div className="flex gap-2 mb-6">
                      <input
                        type="text"
                        placeholder="Add a skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border transition-all"
                        style={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 shadow-md"
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
                      >
                        Add
                      </button>
                    </div>

                    {/* Suggested Skills */}
                    <div>
                      <p className="text-xs font-medium mb-3" style={{ color: '#6b7280' }}>Suggested Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSkills.filter(s => !formData.skills.includes(s)).map((skill, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                skills: [...prev.skills, skill]
                              }));
                            }}
                            className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-sm"
                            style={{ 
                              backgroundColor: 'white',
                              color: '#6b7280',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            + {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                        style={{ 
                          backgroundColor: 'white', 
                          color: '#1f2937',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <ArrowLeft size={18} />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
                        {!loading && <ArrowRight size={18} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
