import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function Password() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const onSubmit = async (data) => {
    try {
      

      const response = await fetch("http://localhost:5000/UpdatePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials:'include',
      });

      const resData = await response.json();

      if (response.ok) {
        localStorage.removeItem("email");
        setMessage(resData.message);
        navigate("/login");
      } else {
        setError(resData.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const password = watch("password");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">🔒 Reset Password</h2>

        {/* Success or Error Messages */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded border border-red-300 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded border border-green-300 text-sm">
            {message}
          </div>
        )}

        {/* New Password */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("confirmPassword", {
              required: "Confirm password is required",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}

export default Password;
