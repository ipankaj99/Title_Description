import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const navigate = useNavigate();

  const [otpReceived, setOtpReceived] = useState(false);
  const [error, setError] = useState(null);
  const [otpError, setOTPError] = useState(null);
  const [otpTimeLeft, setOtpTimeLeft] = useState(120); // Initially 0


  

  // Send OTP to email
  async function onSubmit(data) {
    try {
      const response = await fetch(`http://localhost:5000/forgot/${data.email}`);
      const result = await response.json();

      if (response.ok) {
        setOtpReceived(true);
        setError("");
        setOTPError(result.message || "OTP sent successfully to your email");
        setOtpTimeLeft(60); // Start 60s countdown
        const time=setInterval(()=>
        {
          setOtpTimeLeft((prev)=>
          {
            if(prev<=1)
            {
              setOTPError("OTP is expired");
              setOtpReceived(false);
              clearInterval(time);

              return 0;
            }
            return prev-1;
          })
        }, 1000)

      } else {
        setError(result.message);
        setOtpReceived(false);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setOtpReceived(false);
    }
  }

  // Submit OTP and email to verify
  async function recievedOTP(data) {
    try {
      const response = await fetch("http://localhost:5000/ChangePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        navigate("/password");
      } else {
        setOTPError(result.message || "Something went wrong");
      }
    } catch (err) {
      setOTPError(err.message || "Failed to connect to the server");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
       onSubmit={handleSubmit((data) => {
  if (otpReceived) {
    return recievedOTP(data);
  } else {
    return onSubmit(data);
  }
})}

        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md space-y-5"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Forgot Password
        </h2>

        {/* Email Field */}
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Show Error */}
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        {/* OTP Section */}
        <div>
          {otpReceived ? (
            <div>
              <p className="text-green-600 text-sm text-center">{otpError}</p>
              <p className="text-sm text-gray-500 text-center mb-2">
                OTP will expire in {otpTimeLeft}s
              </p>

              {/* OTP Input */}
              <label className="block text-gray-700 mb-1">OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                {...register("otp", {
                  required: "OTP is required",
                  minLength: {
                    value: 6,
                    message: "OTP must be 6 digits",
                  },
                  maxLength: {
                    value: 6,
                    message: "OTP must be 6 digits",
                  },
                })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
              )}

              {/* Confirm OTP Button */}
              <button
                type="submit"
                className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200"
              >
                {isSubmitting ? "Confirming..." : "Confirm OTP"}
              </button>
            </div>
          ) : (
            <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
           
            disabled={isSubmitting}
          >
           {otpTimeLeft === 120 ? (
  isSubmitting ? "Sending OTP..." : "Send OTP"
) : otpTimeLeft === 0 ? (
  isSubmitting
   ? "Resending OTP..." : "Resend OTP"
) : (
  `Resend OTP in ${otpTimeLeft}s`
)}


          </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
