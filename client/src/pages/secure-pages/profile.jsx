import React, { useState, useEffect } from "react";
import { User, Mail, Phone, AtSign, Loader2, AlertCircle } from "lucide-react";
import { getCurrentUser, updateUser } from "../../services/userService";
import { useNavigate } from "react-router-dom";
const InputField = React.memo(
  ({ icon: Icon, label, name, value, onChange, disabled }) => {
    const inputRef = React.useRef(null);

    const handleInputChange = (e) => {
      onChange(e);
      if (inputRef.current) {
        const length = e.target.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-[#3572ef]" />
          <label className="text-sm font-medium text-[#3572ef]">{label}</label>
        </div>
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value || ""}
          onChange={handleInputChange}
          className="w-full p-2 border border-[#050c9c]/20 rounded-lg focus:ring-2 focus:ring-[#3abef9] focus:border-[#3abef9] transition-all duration-200 bg-white shadow-sm hover:border-[#3abef9]"
          disabled={disabled}
        />
      </div>
    );
  }
);

const ProfileField = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-lg border border-[#050c9c]/10 shadow-md p-4 hover:border-[#3abef9] transition-colors duration-200">
    <div className="flex items-center space-x-2 text-[#3572ef] mb-2">
      <Icon className="h-4 w-4" />
      <h3 className="text-sm font-medium">{label}</h3>
    </div>
    <p className="text-gray-900 font-medium">{value || "—"}</p>
  </div>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.user);
      setFormData({
        first_name: response.user.first_name,
        middle_name: response.user.middle_name || "",
        last_name: response.user.last_name,
        email: response.user.email,
        phone_number: response.user.phone_number,
        username: response.user.username,
      });
    } catch (error) {
      setError("Failed to fetch user data");
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await updateUser(formData);
      setUser(response.user);
      setIsEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#050c9c]" />
          <p className="text-[#3572ef]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#050c9c] border-b border-[#050c9c]/10 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-white/90 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="ml-1">Back</span>
            </button>
            <h1 className="text-xl font-semibold text-white">
              Profile Settings
            </h1>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 shadow-sm">
              <AlertCircle size={20} className="text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#050c9c]/10 shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {isEditing ? "Edit Profile Information" : "Profile Information"}
              </h2>
              <p className="text-sm text-[#3572ef]">
                {isEditing
                  ? "Update your personal information below"
                  : "View and manage your personal information"}
              </p>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    icon={User}
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <InputField
                    icon={User}
                    label="Middle Name"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <InputField
                    icon={User}
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <InputField
                    icon={Mail}
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <InputField
                    icon={AtSign}
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <InputField
                    icon={Phone}
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-[#050c9c] bg-white border border-[#050c9c]/20 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-[#050c9c] rounded-lg hover:bg-[#3572ef] transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField
                    icon={User}
                    label="First Name"
                    value={user.first_name}
                  />
                  <ProfileField
                    icon={User}
                    label="Middle Name"
                    value={user.middle_name}
                  />
                  <ProfileField
                    icon={User}
                    label="Last Name"
                    value={user.last_name}
                  />
                  <ProfileField icon={Mail} label="Email" value={user.email} />
                  <ProfileField
                    icon={AtSign}
                    label="Username"
                    value={user.username}
                  />
                  <ProfileField
                    icon={Phone}
                    label="Phone Number"
                    value={user.phone_number}
                  />
                </div>
                <div className="flex justify-end pt-6 border-t">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-white bg-[#050c9c] rounded-lg hover:bg-[#3572ef] transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                    disabled={isLoading}
                  >
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
