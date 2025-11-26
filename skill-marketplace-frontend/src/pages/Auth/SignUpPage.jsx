import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Upload, X } from 'lucide-react';
import { Button } from '../../components/ui/button';

const SignUpPage = () => {
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
  const [resume, setResume] = useState(null);
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: true,
    message: ''
  });

  const { name, email, password, university, skills, experience, education } = formData;
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (e.target.name === 'password') {
      if (e.target.value.length < 6 && e.target.value.length > 0) {
        setPasswordValidation({
          isValid: false,
          message: 'Password must be at least 6 characters'
        });
      } else {
        setPasswordValidation({
          isValid: true,
          message: ''
        });
      }
    }
    
    if (error) clearError();
    if (localError) setLocalError('');
  };

  const handleFileChange = useCallback((e) => {
    if (e.target.name === 'profilePicture') {
      setProfilePicture(e.target.files[0]);
    } else if (e.target.name === 'resume') {
      setResume(e.target.files[0]);
    }
  }, []);

  const removeFile = useCallback((type) => {
    if (type === 'profilePicture') {
      setProfilePicture(null);
    } else if (type === 'resume') {
      setResume(null);
    }
  }, []);

  const handleExperienceChange = useCallback((index, e) => {
    const newExperience = [...experience];
    newExperience[index][e.target.name] = e.target.value;
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
    newEducation[index][e.target.name] = e.target.value;
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
    
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }
    
    if (!email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      setLocalError('Please enter a valid email address');
      return;
    }

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
      console.error('Registration failed:', error);
      setLocalError(error.message || 'Registration failed. Please try again.');
    }
  };

  const displayError = error || localError;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        fontFamily: 'Circular, "Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        <div>
          <h1 
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Get started
          </h1>
          <p 
            className="text-sm mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            Create a new account
          </p>

          {/* Error Display */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-md text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444'
              }}
            >
              {displayError}
            </motion.div>
          )}

          {/* Social Signup Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 rounded-md flex items-center justify-center gap-3 text-sm font-normal transition-all duration-200"
              style={{
                backgroundColor: 'var(--bg-accent)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
              </svg>
              Continue with GitHub
            </Button>
          </div>

          {/* Signup Form - No divider here */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2" 
                  htmlFor="name"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 rounded-md focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2" 
                  htmlFor="university"
                  style={{ color: 'var(--text-primary)' }}
                >
                  University
                </label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  value={university}
                  onChange={onChange}
                  placeholder="State University"
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 rounded-md focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2" 
                htmlFor="email"
                style={{ color: 'var(--text-primary)' }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full py-2.5 px-3 rounded-md focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                style={{
                  backgroundColor: 'var(--bg-accent)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2" 
                htmlFor="password"
                style={{ color: 'var(--text-primary)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 pr-10 rounded-md focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    borderColor: !passwordValidation.isValid ? '#ef4444' : 'var(--border-color)',
                    color: 'var(--text-primary)',
                    border: `1px solid ${!passwordValidation.isValid ? '#ef4444' : 'var(--border-color)'}`
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!passwordValidation.isValid && (
                <p className="text-xs mt-1 text-red-400">{passwordValidation.message}</p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2" 
                htmlFor="skills"
                style={{ color: 'var(--text-primary)' }}
              >
                Skills (comma-separated)
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={skills}
                onChange={onChange}
                placeholder="JavaScript, React, Node.js"
                disabled={isLoading}
                className="w-full py-2.5 px-3 rounded-md focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                style={{
                  backgroundColor: 'var(--bg-accent)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Profile Picture
                </label>
                {!profilePicture ? (
                  <label
                    htmlFor="profilePicture"
                    className="w-full py-8 px-3 rounded-md border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:border-opacity-60"
                    style={{
                      backgroundColor: 'var(--bg-accent)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <Upload size={24} />
                    <span className="text-xs">Upload Image</span>
                    <input
                      type="file"
                      id="profilePicture"
                      name="profilePicture"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div 
                    className="w-full py-3 px-3 rounded-md border flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--bg-accent)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span className="text-xs truncate">{profilePicture.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile('profilePicture')}
                      className="ml-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Resume (PDF)
                </label>
                {!resume ? (
                  <label
                    htmlFor="resume"
                    className="w-full py-8 px-3 rounded-md border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:border-opacity-60"
                    style={{
                      backgroundColor: 'var(--bg-accent)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <Upload size={24} />
                    <span className="text-xs">Upload PDF</span>
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div 
                    className="w-full py-3 px-3 rounded-md border flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--bg-accent)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span className="text-xs truncate">{resume.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile('resume')}
                      className="ml-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Experience Section */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Experience (Optional)
                </h3>
                <Button
                  type="button"
                  onClick={addExperienceField}
                  size="sm"
                  className="text-xs"
                  style={{
                    backgroundColor: 'var(--button-action)',
                    color: '#fff'
                  }}
                >
                  Add Experience
                </Button>
              </div>

              {experience.map((exp, index) => (
                <div 
                  key={index} 
                  className="space-y-3 p-4 rounded-lg mb-4 border"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Experience {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExperienceField(index)}
                      style={{ color: '#ef4444' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="title"
                      value={exp.title}
                      onChange={(e) => handleExperienceChange(index, e)}
                      placeholder="Job Title"
                      className="w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <input
                      type="text"
                      name="company"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, e)}
                      placeholder="Company"
                      className="w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="date"
                      name="from"
                      value={exp.from}
                      onChange={(e) => handleExperienceChange(index, e)}
                      placeholder="From"
                      className="w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <input
                      type="date"
                      name="to"
                      value={exp.to}
                      onChange={(e) => handleExperienceChange(index, e)}
                      placeholder="To"
                      className="w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                  </div>

                  <textarea
                    name="description"
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, e)}
                    placeholder="Description"
                    rows="2"
                    className="w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Education (Optional)
                </h3>
                <Button
                  type="button"
                  onClick={addEducationField}
                  size="sm"
                  className="text-xs"
                  style={{
                    backgroundColor: 'var(--button-action)',
                    color: '#fff'
                  }}
                >
                  Add Education
                </Button>
              </div>

              {education.map((edu, index) => (
                <div 
                  key={index} 
                  className="space-y-3 p-4 rounded-lg mb-4 border"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Education {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEducationField(index)}
                      style={{ color: '#ef4444' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="school"
                      value={edu.school}
                      onChange={(e) => handleEducationChange(index, e)}
                      placeholder="School"
                      className="w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <input
                      type="text"
                      name="degree"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, e)}
                      placeholder="Degree"
                      className="w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    name="fieldofstudy"
                    value={edu.fieldofstudy}
                    onChange={(e) => handleEducationChange(index, e)}
                    placeholder="Field of Study"
                    className="w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="date"
                      name="from"
                      value={edu.from}
                      onChange={(e) => handleEducationChange(index, e)}
                      placeholder="From"
                      className="w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <input
                      type="date"
                      name="to"
                      value={edu.to}
                      onChange={(e) => handleEducationChange(index, e)}
                      placeholder="To"
                      className="w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                  </div>

                  <textarea
                    name="description"
                    value={edu.description}
                    onChange={(e) => handleEducationChange(index, e)}
                    placeholder="Description"
                    rows="2"
                    className="w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-md text-sm font-medium transition-all duration-200 mt-6"
              style={{
                backgroundColor: 'var(--button-action)',
                color: '#fff'
              }}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <p 
            className="mt-8 text-center text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Have an account?{' '}
            <Link 
              to="/login" 
              className="font-medium hover:underline"
              style={{ color: 'var(--button-action)' }}
            >
              Log In Now
            </Link>
          </p>

          <p 
            className="mt-8 text-center text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            By continuing, you agree to Peerly's{' '}
            <Link to="/terms" className="underline hover:no-underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:no-underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;

