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
    }
    if (resume) {
      data.append('resume', resume);
    }
    
    try {
      const response = await authAPI.updateProfile(data);
      
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

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Error Message */}
        {localError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border bg-red-100 dark:bg-red-900/10 border-red-200 dark:border-red-900/30"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{localError}</p>
          </motion.div>
        )}

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Profile Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 shadow-xl border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div 
                      className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'var(--bg-accent)', 
                        border: '3px solid var(--button-action)' 
                      }}
                    >
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera size={40} style={{ color: 'var(--text-secondary)' }} />
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
                      className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 inline-block text-white"
                      style={{ 
                        backgroundColor: 'var(--button-action)',
                      }}
                    >
                      Upload Photo
                    </span>
                  </label>
                </div>

                {/* Basic Info Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={onChange}
                      required
                      disabled={isLoading}
                      placeholder="Alex Morgan"
                      className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all border"
                      style={{ 
                        backgroundColor: 'var(--bg-primary)', 
                        borderColor: 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        '--tw-ring-color': 'var(--button-action)' 
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Headline</label>
                    <input
                      type="text"
                      name="headline"
                      placeholder="Senior Product Designer"
                      className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all border"
                      style={{ 
                        backgroundColor: 'var(--bg-primary)', 
                        borderColor: 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        '--tw-ring-color': 'var(--button-action)' 
                      }}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Current Position</label>
                    <input
                      type="text"
                      name="currentPosition"
                      placeholder="UX Designer at TechCorp"
                      className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all border"
                      style={{ 
                        backgroundColor: 'var(--bg-primary)', 
                        borderColor: 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        '--tw-ring-color': 'var(--button-action)' 
                      }}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Location</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="San Francisco, CA"
                      className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all border"
                      style={{ 
                        backgroundColor: 'var(--bg-primary)', 
                        borderColor: 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        '--tw-ring-color': 'var(--button-action)' 
                      }}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-6">
                  <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Contact Info</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 border"
                        style={{ 
                          backgroundColor: 'var(--bg-primary)', 
                          borderColor: 'var(--border-color)', 
                          color: 'var(--text-primary)',
                          '--tw-ring-color': 'var(--button-action)' 
                        }}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} style={{ color: 'var(--text-secondary)' }} />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 border"
                        style={{ 
                          backgroundColor: 'var(--bg-primary)', 
                          borderColor: 'var(--border-color)', 
                          color: 'var(--text-primary)',
                          '--tw-ring-color': 'var(--button-action)' 
                        }}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Linkedin size={16} style={{ color: 'var(--text-secondary)' }} />
                      <input
                        type="text"
                        name="linkedin"
                        placeholder="LinkedIn URL"
                        className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 border"
                        style={{ 
                          backgroundColor: 'var(--bg-primary)', 
                          borderColor: 'var(--border-color)', 
                          color: 'var(--text-primary)',
                          '--tw-ring-color': 'var(--button-action)' 
                        }}
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
                className="rounded-2xl p-6 shadow-lg border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>About Me</h2>
                
                {/* Text Formatting Toolbar */}
                <div 
                  className="flex items-center gap-1 p-2 rounded-t-xl border-b mb-0"
                  style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}
                >
                  {[Bold, Italic, Underline].map((Icon, index) => (
                    <button
                      key={index}
                      type="button"
                      className="p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Icon size={16} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                  ))}
                  <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border-color)' }} />
                  <button type="button" className="p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <List size={16} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
                
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-b-xl text-sm focus:outline-none resize-none border-0"
                  style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-primary)' }}
                  disabled={isLoading}
                />
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 text-white"
                    style={{ backgroundColor: 'var(--button-action)' }}
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
                className="rounded-2xl p-6 shadow-lg border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Experience</h2>
                
                <div className="space-y-4">
                  {experience.map((exp, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl border relative"
                      style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          name="title"
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="Job Title"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
                          disabled={isLoading}
                        />
                        <input
                          type="text"
                          name="company"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="Company"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="date"
                          name="from"
                          value={exp.from ? exp.from.substring(0, 10) : ''}
                          onChange={(e) => handleExperienceChange(index, e)}
                          className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
                          disabled={isLoading}
                        />
                        <input
                          type="date"
                          name="to"
                          value={exp.to ? exp.to.substring(0, 10) : ''}
                          onChange={(e) => handleExperienceChange(index, e)}
                          className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
                          disabled={isLoading}
                        />
                      </div>
                      <textarea
                        name="description"
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(index, e)}
                        placeholder="Description"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
                        disabled={isLoading}
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          type="button"
                          className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <Edit2 size={14} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExperienceField(index)}
                          className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
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
                  className="mt-4 w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 font-medium text-sm text-white"
                  style={{ backgroundColor: 'var(--button-action)' }}
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
                className="rounded-2xl p-6 shadow-lg border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Education</h2>
                
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl border relative"
                      style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          name="school"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(index, e)}
                          placeholder="School/University"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
                          disabled={isLoading}
                        />
                        <input
                          type="text"
                          name="degree"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, e)}
                          placeholder="Degree"
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
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
                          className="px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
                          disabled={isLoading}
                        />
                        <input
                          type="date"
                          name="from"
                          value={edu.from ? edu.from.substring(0, 10) : ''}
                          onChange={(e) => handleEducationChange(index, e)}
                          className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
                          disabled={isLoading}
                        />
                        <input
                          type="date"
                          name="to"
                          value={edu.to ? edu.to.substring(0, 10) : ''}
                          onChange={(e) => handleEducationChange(index, e)}
                          className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
                          disabled={isLoading}
                        />
                      </div>
                      <textarea
                        name="description"
                        value={edu.description}
                        onChange={(e) => handleEducationChange(index, e)}
                        placeholder="Description"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
                        disabled={isLoading}
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          type="button"
                          className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <Edit2 size={14} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEducationField(index)}
                          className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
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
                  className="mt-4 px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 text-white"
                  style={{ backgroundColor: 'var(--button-action)' }}
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
                className="rounded-2xl p-6 shadow-lg border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Skills</h2>
                
                <div className="mb-4">
                  <input
                    type="text"
                    name="skills"
                    value={skills}
                    onChange={onChange}
                    placeholder="e.g. Figma, Sketch, Adobe XD, HTML/CSS (comma-separated)"
                    className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--button-action)' }}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.split(',').filter(s => s.trim()).map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm font-medium border"
                      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-4 px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 text-white"
                  style={{ backgroundColor: 'var(--button-action)' }}
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
                className="rounded-2xl p-6 shadow-lg border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Resume</h2>
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
                    className="border-2 border-dashed rounded-xl p-6 text-center hover:border-opacity-50 transition-colors border"
                    style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)', '--tw-border-opacity': '0.5' }}
                  >
                    <FileText size={32} className="mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                  className="px-8 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  style={{ backgroundColor: 'var(--button-action)' }}
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