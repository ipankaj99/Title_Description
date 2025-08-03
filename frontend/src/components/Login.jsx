import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, NavLink } from "react-router-dom";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");

  async function onSubmit(data) {
    try {
      setServerError("");

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        navigate("/dashboard");
      } else {
        setServerError(result.message || "Login failed");
      }
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-semibold mb-6 text-center text-blue-700">
          Welcome Back
        </h2>

        {/* Email */}
        <label className="block text-gray-700 mb-1">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          })}
          className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>
        )}

        {/* Password */}
        <label className="block text-gray-700 mb-1 mt-4">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          {...register("password", {
            required: "Password is required",
          })}
          className="w-full p-3 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-2">
            {errors.password.message}
          </p>
        )}

        {/* Server error */}
        {serverError && (
          <p className="text-red-600 text-center text-sm mb-4">
            {serverError}
          </p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-3 rounded-lg mt-4 hover:bg-blue-600 transition disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        {/* Links */}
        <div className="flex justify-between mt-5 text-sm text-blue-600">
          <NavLink to="/forgot-password" className="hover:underline">
            Forgot Password?
          </NavLink>
          <NavLink to="/" className="hover:underline">
            Register Here
          </NavLink>
        </div>
      </form>
    </div>
  );
}

export default Login;
