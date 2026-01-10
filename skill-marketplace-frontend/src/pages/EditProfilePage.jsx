import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Camera, User, Mail, Phone, Linkedin, MapPin, Briefcase, 
  GraduationCap, Plus, X, Edit2, Trash2, Save, ArrowLeft,
  Facebook, Twitter, Instagram, Bold, Italic, Underline, 
  List, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';

const EditProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    skills: '',
    experience: [],
    education: [],
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [resume, setResume] = useState(null);
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const profileResponse = await authAPI.getProfile();
        const profile = profileResponse.user;
        setFormData({
          name: profile.name || '',
          university: profile.university || '',
          skills: profile.skills ? profile.skills.join(', ') : '',
          experience: profile.experience || [],
          education: profile.education || [],
        });
        if (profile.profilePicture) {
          setProfilePreview(profile.profilePicture.startsWith('http') 
            ? profile.profilePicture 
            : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${profile.profilePicture}`);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLocalError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const { name, university, skills, experience, education } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = useCallback((e) => {
    if (e.target.name === 'profilePicture') {
      const file = e.target.files[0];
      setProfilePicture(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (e.target.name === 'resume') {
      setResume(e.target.files[0]);
    }
  }, []);

  const handleExperienceChange = useCallback((index, e) => {
    const newExperience = [...experience];
    newExperience[index] = { ...newExperience[index], [e.target.name]: e.target.value };
    setFormData({ ...formData, experience: newExperience });
  }, [formData, experience]);

  const addExperienceField = useCallback(() => {
    setFormData({
      ...formData,
      experience: [...experience, { title: '', company: '', from: '', to: '', current: false, description: '' }]
    });
  }, [formData, experience]);

  const removeExperienceField = useCallback((index) => {
    const newExperience = experience.filter((_, i) => i !== index);
    setFormData({ ...formData, experience: newExperience });
  }, [formData, experience]);

  const handleEducationChange = useCallback((index, e) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [e.target.name]: e.target.value };
    setFormData({ ...formData, education: newEducation });
  }, [formData, education]);

  const addEducationField = useCallback(() => {
    setFormData({
      ...formData,
      education: [...education, { school: '', degree: '', fieldofstudy: '', from: '', to: '', current: false, description: '' }]
    });
  }, [formData, education]);

  const removeEducationField = useCallback((index) => {
    const newEducation = education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: newEducation });
  }, [formData, education]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    data.append('name', name);
    data.append('university', university);
    data.append('skills', skills);
    data.append('experience', JSON.stringify(experience));
    data.append('education', JSON.stringify(education));
    if (profilePicture) {
      data.append('profilePicture', profilePicture);
      console.log('Uploading profile picture:', profilePicture.name);
    }
    if (resume) {
      data.append('resume', resume);
      console.log('Uploading resume:', resume.name);
    }
    
    try {
      const response = await authAPI.updateProfile(data);
      console.log('Profile update response:', response);
      
      if (response.user) {
        const token = localStorage.getItem('token');
        if (token) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      
      alert('Profile updated successfully!');
      navigate('/dashboard');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error updating profile:', error);
      setLocalError(error.message || 'Profile update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--text-primary)',
  };

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#0a0e1a' }}>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: '#94a3b8' }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Error Message */}
        {localError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <p className="text-sm text-red-400">{localError}</p>
          </motion.div>
        )}

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Dark Theme Profile Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 shadow-xl"
                style={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div 
                      className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center"
                      style={{ 
                        backgroundColor: '#2d3548', 
                        border: '3px solid rgba(16, 185, 129, 0.3)' 
                      }}
                    >
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera size={40} style={{ color: '#6b7280' }} />
                      )}
                    </div>
                  </div>

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      name="profilePicture"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <span 
                      className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 inline-block"
                      style={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                      }}
                    >
                      Upload Photo
                    </span>
                  </label>
                </div>

                {/* Basic Info Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-400">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={onChange}
                      required
                      disabled={isLoading}
                      placeholder="Alex Morgan"
                      className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      style={{ backgroundColor: '#2d3548', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-400">Headline</label>
                    <input
                      type="text"
                      name="headline"
                      placeholder="Senior Product Designer"
                      className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      style={{ backgroundColor: '#2d3548', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-400">Current Position</label>
                    <input
                      type="text"
                      name="currentPosition"
                      placeholder="UX Designer at TechCorp"
                      className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      style={{ backgroundColor: '#2d3548', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-400">Location</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="San Francisco, CA"
                      className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      style={{ backgroundColor: '#2d3548', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-6">
                  <h3 className="text-xs font-semibold mb-3 text-gray-400">Contact Info</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Mail size={16} style={{ color: '#6b7280' }} />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        style={{ backgroundColor: '#2d3548', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#e7e9eb' }}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} style={{ color: '#6b7280' }} />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        style={{ backgroundColor: '#2d3548', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#e7e9eb' }}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Linkedin size={16} style={{ color: '#6b7280' }} />
                      <input
                        type="text"
                        name="linkedin"
                        placeholder="LinkedIn URL"
                        className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        style={{ backgroundColor: '#2d3548', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#e7e9eb' }}
                        disabled={isLoading}
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
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                      style={{ backgroundColor: color }}
                    >
                      <Icon size={18} color="white" />
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Panel - Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* About Me Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#e5e7eb' }}>About Me</h2>
                
                {/* Text Formatting Toolbar */}
                <div 
                  className="flex items-center gap-1 p-2 rounded-t-xl border-b mb-0"
                  style={{ backgroundColor: '#2d3548', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  {[Bold, Italic, Underline].map((Icon, index) => (
                    <button
                      key={index}
                      type="button"
                      className="p-2 rounded hover:bg-gray-700 transition-colors"
                    >
                      <Icon size={16} style={{ color: '#94a3b8' }} />
                    </button>
                  ))}
                  <div className="w-px h-5 mx-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <button type="button" className="p-2 rounded hover:bg-gray-700 transition-colors">
                    <List size={16} style={{ color: '#94a3b8' }} />
                  </button>
                </div>
                
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-b-xl text-sm focus:outline-none resize-none border-0"
                  style={{ backgroundColor: '#2d3548', color: '#e5e7eb' }}
                  disabled={isLoading}
                />
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: '#3b82f6', color: 'white' }}
                    disabled={isLoading}
                  >
                    Save Bio
                  </button>
                </div>
              </motion.div>

              {/* Experience Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#e5e7eb' }}>Experience</h2>
                
                <div className="space-y-4">
                  {experience.map((exp, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl border relative"
                      style={{ backgroundColor: '#2d3548', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          name="title"
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="Job Title"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: '#1a1f2e', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                          disabled={isLoading}
                        />
                        <input
                          type="text"
                          name="company"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="Company"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: '#1a1f2e', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="date"
                          name="from"
                          value={exp.from ? exp.from.substring(0, 10) : ''}
                          onChange={(e) => handleExperienceChange(index, e)}
                          className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: '#1a1f2e', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                          disabled={isLoading}
                        />
                        <input
                          type="date"
                          name="to"
                          value={exp.to ? exp.to.substring(0, 10) : ''}
                          onChange={(e) => handleExperienceChange(index, e)}
                          className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: '#1a1f2e', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                          disabled={isLoading}
                        />
                      </div>
                      <textarea
                        name="description"
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(index, e)}
                        placeholder="Description"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        style={{ backgroundColor: '#1a1f2e', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                        disabled={isLoading}
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          type="button"
                          className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                        >
                          <Edit2 size={14} style={{ color: '#94a3b8' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExperienceField(index)}
                          className="p-1.5 rounded hover:bg-red-900/30 transition-colors"
                          disabled={isLoading}
                        >
                          <Trash2 size={14} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addExperienceField}
                  className="mt-4 w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 font-medium text-sm"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
                  disabled={isLoading}
                >
                  <Plus size={18} />
                  Add Experience
                </button>
              </motion.div>

              {/* Education Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#e5e7eb' }}>Education</h2>
                
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl border relative"
                      style={{ backgroundColor: '#2d3548', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          name="school"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(index, e)}
                          placeholder="School/University"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: '#1a1f2e', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                          disabled={isLoading}
                        />
                        <input
                          type="text"
                          name="degree"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, e)}
                          placeholder="Degree"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: '#1a1f2e', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <input
                          type="text"
                          name="fieldofstudy"
                          value={edu.fieldofstudy}
                          onChange={(e) => handleEducationChange(index, e)}
                          placeholder="Field of Study"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: '#1a1f2e', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                          disabled={isLoading}
                        />
                        <input
                          type="date"
                          name="from"
                          value={edu.from ? edu.from.substring(0, 10) : ''}
                          onChange={(e) => handleEducationChange(index, e)}
                          className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: '#1a1f2e', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                          disabled={isLoading}
                        />
                        <input
                          type="date"
                          name="to"
                          value={edu.to ? edu.to.substring(0, 10) : ''}
                          onChange={(e) => handleEducationChange(index, e)}
                          className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: '#1a1f2e', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                          disabled={isLoading}
                        />
                      </div>
                      <textarea
                        name="description"
                        value={edu.description}
                        onChange={(e) => handleEducationChange(index, e)}
                        placeholder="Description"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        style={{ backgroundColor: '#1a1f2e', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                        disabled={isLoading}
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          type="button"
                          className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                        >
                          <Edit2 size={14} style={{ color: '#94a3b8' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEducationField(index)}
                          className="p-1.5 rounded hover:bg-red-900/30 transition-colors"
                          disabled={isLoading}
                        >
                          <Trash2 size={14} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addEducationField}
                  className="mt-4 px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: '#3b82f6', color: 'white' }}
                  disabled={isLoading}
                >
                  Add Education
                </button>
              </motion.div>

              {/* Skills Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#e5e7eb' }}>Skills</h2>
                
                <div className="mb-4">
                  <input
                    type="text"
                    name="skills"
                    value={skills}
                    onChange={onChange}
                    placeholder="e.g. Figma, Sketch, Adobe XD, HTML/CSS (comma-separated)"
                    className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: '#2d3548', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb' }}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.split(',').filter(s => s.trim()).map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{ backgroundColor: '#2d3548', color: '#e5e7eb', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-4 px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
                  disabled={isLoading}
                >
                  Add Skill
                </button>
              </motion.div>

              {/* Resume Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#e5e7eb' }}>Resume</h2>
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    name="resume"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <div 
                    className="border-2 border-dashed rounded-xl p-6 text-center hover:border-blue-500 transition-colors"
                    style={{ backgroundColor: '#2d3548', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <FileText size={32} className="mx-auto mb-2" style={{ color: '#94a3b8' }} />
                    <p className="text-sm" style={{ color: '#94a3b8' }}>
                      {resume ? resume.name : 'Click to upload PDF resume'}
                    </p>
                  </div>
                </label>
              </motion.div>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-end"
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
                >
                  {isLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
