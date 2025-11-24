import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';

const EditProfilePage = () => {
  const { user, setUser } = useAuth();
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
        // You might want to display existing profilePicture/resume if applicable
        // For now, we'll just not pre-fill file inputs
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
      setProfilePicture(e.target.files[0]);
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
    if (profilePicture) data.append('profilePicture', profilePicture);
    if (resume) data.append('resume', resume);
    
    try {
      const updatedUser = await authAPI.updateProfile(data); // Pass true to indicate FormData
      setUser(updatedUser.user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      setLocalError(error.message || 'Profile update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="aurora-background"></div>
      <div className="relative z-10 flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl w-full max-w-2xl"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8" style={{ color: 'var(--text-primary)' }}>
            Edit Profile
          </h2>

          {localError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
            >
              {localError}
            </motion.div>
          )}
          
          {isLoading && <p className="text-center" style={{ color: 'var(--text-primary)' }}>Loading profile data...</p>}

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="name" style={{ color: 'var(--text-primary)' }}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                  disabled={isLoading}
                  className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="university" style={{ color: 'var(--text-primary)' }}>
                  University
                </label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  value={university}
                  onChange={onChange}
                  disabled={isLoading}
                  className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="skills" style={{ color: 'var(--text-primary)' }}>
                Skills (comma-separated)
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={skills}
                onChange={onChange}
                disabled={isLoading}
                className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="profilePicture" style={{ color: 'var(--text-primary)' }}>
                  Profile Picture (Image)
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    '--file-bg': 'var(--button-primary)',
                    '--file-text': 'var(--button-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="resume" style={{ color: 'var(--text-primary)' }}>
                  Resume (PDF)
                </label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    '--file-bg': 'var(--button-primary)',
                    '--file-text': 'var(--button-text)'
                  }}
                />
              </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4" style={{ color: 'var(--text-primary)' }}>Experience</h3>
            {experience.map((exp, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Title</label>
                    <input type="text" name="title" value={exp.title} onChange={(e) => handleExperienceChange(index, e)}
                      className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Company</label>
                    <input type="text" name="company" value={exp.company} onChange={(e) => handleExperienceChange(index, e)}
                      className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>From Date</label>
                    <input type="date" name="from" value={exp.from ? exp.from.substring(0, 10) : ''} onChange={(e) => handleExperienceChange(index, e)}
                      className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>To Date</label>
                    <input type="date" name="to" value={exp.to ? exp.to.substring(0, 10) : ''} onChange={(e) => handleExperienceChange(index, e)}
                      className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Description</label>
                  <textarea name="description" value={exp.description} onChange={(e) => handleExperienceChange(index, e)} rows="3"
                    className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  ></textarea>
                </div>
                <button type="button" onClick={() => removeExperienceField(index)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Remove Experience
                </button>
              </div>
            ))}
            <button type="button" onClick={addExperienceField}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
            >
              Add Experience
            </button>

            <h3 className="text-xl font-bold mt-8 mb-4" style={{ color: 'var(--text-primary)' }}>Education</h3>
            {education.map((edu, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>School</label>
                    <input type="text" name="school" value={edu.school} onChange={(e) => handleEducationChange(index, e)}
                      className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Degree</label>
                    <input type="text" name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)}
                      className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Field of Study</label>
                    <input type="text" name="fieldofstudy" value={edu.fieldofstudy} onChange={(e) => handleEducationChange(index, e)}
                      className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>From Date</label>
                    <input type="date" name="from" value={edu.from ? edu.from.substring(0, 10) : ''} onChange={(e) => handleEducationChange(index, e)}
                      className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>To Date</label>
                    <input type="date" name="to" value={edu.to ? edu.to.substring(0, 10) : ''} onChange={(e) => handleEducationChange(index, e)}
                      className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Description</label>
                  <textarea name="description" value={edu.description} onChange={(e) => handleEducationChange(index, e)} rows="3"
                    className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  ></textarea>
                </div>
                <button type="button" onClick={() => removeEducationField(index)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Remove Education
                </button>
              </div>
            ))}
            <button type="button" onClick={addEducationField}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
            >
              Add Education
            </button>

            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: 'var(--button-primary)',
                color: 'var(--button-text)'
              }}
            >
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfilePage;
