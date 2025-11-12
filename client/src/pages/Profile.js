import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    },
  });

  const onSubmit = async (data) => {
    const profileData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      },
    };

    const result = await updateProfile(profileData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="section">
        <div className="container">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="heading-1">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="btn btn-outline flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        {...register('firstName', {
                          required: 'First name is required',
                          minLength: {
                            value: 2,
                            message: 'First name must be at least 2 characters',
                          },
                        })}
                        type="text"
                        className="input"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        {...register('lastName', {
                          required: 'Last name is required',
                          minLength: {
                            value: 2,
                            message: 'Last name must be at least 2 characters',
                          },
                        })}
                        type="text"
                        className="input"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.lastName}</p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </label>
                  {isEditing ? (
                    <input
                      {...register('phone')}
                      type="tel"
                      className="input"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Address Information</span>
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {/* Street */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  {isEditing ? (
                    <input
                      {...register('street')}
                      type="text"
                      className="input"
                      placeholder="Enter street address"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address?.street || 'Not provided'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    {isEditing ? (
                      <input
                        {...register('city')}
                        type="text"
                        className="input"
                        placeholder="Enter city"
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.city || 'Not provided'}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    {isEditing ? (
                      <input
                        {...register('state')}
                        type="text"
                        className="input"
                        placeholder="Enter state"
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.state || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    {isEditing ? (
                      <input
                        {...register('zipCode')}
                        type="text"
                        className="input"
                        placeholder="Enter zip code"
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.zipCode || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    {isEditing ? (
                      <input
                        {...register('country')}
                        type="text"
                        className="input"
                        placeholder="Enter country"
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.country || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <p className="text-gray-900 capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <p className="text-gray-900">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
