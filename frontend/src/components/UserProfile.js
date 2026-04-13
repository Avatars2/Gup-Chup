import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Camera, Phone, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = ({ onClose }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [pic, setPic] = useState('');
  const [picLoading, setPicLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, setUser, api } = useAuth();

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setMobile(user.mobile);
      setPic(user.pic);
    }
  }, [user]);

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast.error('Please select an image');
      setPicLoading(false);
      return;
    }

    console.log('Uploading image:', pics);
    console.log('Image type:', pics.type);
    console.log('Image size:', pics.size);

    // Check file size (limit to 10MB for profile pictures)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (pics.size > maxSize) {
      setPicLoading(false);
      toast.error('Image size should be less than 10MB');
      return;
    }

    if (pics.type === 'image/jpeg' || pics.type === 'image/png') {
      // Compress image before upload
      compressImage(pics, (compressedImage) => {
        const data = new FormData();
        data.append('file', compressedImage);

        console.log('Uploading compressed image to backend...');

        api.post('/upload', data)
          .then((response) => {
            console.log('Backend response:', response.data);
            if (response.data.url) {
              setPic(response.data.url.toString());
              setPicLoading(false);
              toast.success('Image uploaded successfully');
            } else {
              throw new Error('No URL returned from server');
            }
          })
          .catch((err) => {
            console.error('Backend upload error:', err);
            setPicLoading(false);
            toast.error('Failed to upload image');
          });
      });
    } else {
      setPicLoading(false);
      toast.error('Please select a JPEG or PNG image');
    }
  };

  // Image compression function
  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 300x300 for profile)
        let width = img.width;
        let height = img.height;
        const maxSize = 300;
        
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob((blob) => {
          callback(blob);
        }, 'image/jpeg', 0.7); // 70% quality
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    if (!name) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      console.log('Updating profile with:', { name, pic });
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await api.put(
        '/user/profile',
        { name, pic },
        config
      );

      console.log('Profile update response:', data);

      // Update user in localStorage
      const existingUser = JSON.parse(localStorage.getItem('userInfo'));
      existingUser.name = data.name;
      existingUser.pic = data.pic;
      localStorage.setItem('userInfo', JSON.stringify(existingUser));

      // Update global context state instantly
      setUser(existingUser);

      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-slate-700/50">
        {/* Header */}
        <div className="bg-[#0f172a]/50 p-6 text-white border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center tracking-tight">
              <User className="w-5 h-5 mr-3 text-indigo-400" />
              User Profile
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-xl transition duration-200"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden">
                {pic ? (
                  <img
                    src={pic}
                    alt={name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      setPic(''); // Clear pic to show fallback icon
                    }}
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
              <label
                htmlFor="pic-upload"
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition"
              >
                <Camera className="w-4 h-4 text-gray-600" />
                <input
                  id="pic-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => postDetails(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            {picLoading && (
              <div className="mt-2 text-sm text-indigo-400 animate-pulse">Uploading profile picture...</div>
            )}
          </div>

          {/* User Information */}
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-[#0f172a]/50 text-slate-200 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                Mobile Number
              </label>
              <div className="flex items-center space-x-3 px-4 py-3 bg-[#0f172a]/30 border border-slate-800 rounded-xl">
                <Phone className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300 font-medium">{mobile}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 px-1">Identity verification is tied to this number</p>
            </div>

            {/* Registration Date */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                Member Since
              </label>
              <div className="flex items-center space-x-3 px-4 py-3 bg-[#0f172a]/30 border border-slate-800 rounded-xl">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300 font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Joining now...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#0f172a]/30 border-t border-slate-700/50">
          <button
            onClick={handleUpdateProfile}
            disabled={loading || picLoading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-indigo-500/20"
          >
            {loading ? 'Updating Profile...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
