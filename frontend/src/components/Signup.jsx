import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, NavLink } from "react-router-dom";
import { useRef } from "react";
function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm();

  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [otpMessage, setOTPMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [otpTimeLeft, setOtpTimeLeft]=useState(120);
   const timer=useRef(null);

  async function sendOTP() {
    const email = watch("email");
    setServerError("");
    setOTPMessage("");

   console.log("one");

    if (!email) {
      setServerError("Please enter your email before requesting OTP.");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("http://localhost:5000/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerifyEmail(true);
        setOTPMessage(data.message || "OTP sent successfully to your email");
        setOtpTimeLeft(60);
        if(timer.current)
        {
          clearInterval(timer.current);
          timer.current=null;
        }
          timer.current=setInterval(()=>
          {
           setOtpTimeLeft((prev)=>{
            if(prev<=1)
            {
               setOTPMessage("otp is expired");
               setVerifyEmail(false);
               clearInterval(timer.current);
               return 0;

            }return prev-1;
          }
        )
        }, 1000)
      } else {
        setVerifyEmail(false);
        setServerError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setVerifyEmail(false);
      setServerError("Server error while sending OTP");
    } finally {
      setIsSending(false);
    }
  }

  async function onSubmit(data) {
    setServerError("");

    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("profilePic", data.profilePic[0]);
      formData.append("otp", data.otp);

      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        navigate("/dashboard");
      } else {
        setServerError(result.message || "Signup failed");
      }
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Signup
        </h2>

        <input
          type="text"
          placeholder="Username"
          {...register("username", {
            required: "Username is required",
          })}
          className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.username && (
          <p className="text-red-500 text-sm mb-2">{errors.username.message}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          })}
          className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>
        )}

        <input
          type="password"
          placeholder="Password"
          {...register("password", {
            required: "Password is required",
          })}
          className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-2">{errors.password.message}</p>
        )}

        <input
          type="file"
          accept="image/*"
          {...register("profilePic", {
            required: "Profile picture is required",
          })}
          className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.profilePic && (
          <p className="text-red-500 text-sm mb-2">
            {errors.profilePic.message}
          </p>
        )}

        {verifyEmail && (
          <>
            <p className="text-green-600 text-sm mb-2">{otpMessage}</p>
            <p>OTP expires in : {otpTimeLeft}</p>
            <input
              type="text"
              placeholder="Enter OTP"
              {...register("otp", {
                required: "OTP is required",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "OTP must be a 6-digit number",
                },
              })}
              className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.otp && (
              <p className="text-red-500 text-sm mb-2">{errors.otp.message}</p>
            )}
          </>
        )}

        {serverError && (
          <p className="text-red-600 text-sm text-center mb-4">{serverError}</p>
        )}

        {!verifyEmail ? (
          <button
            type="button"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
            onClick={sendOTP}
            disabled={isSending}
          >
           {otpTimeLeft === 120 ? (
  isSending ? "Sending OTP..." : "Send OTP"
) : otpTimeLeft === 0 ? (
  isSending ? "Resending OTP..." : "Resend OTP"
) : (
  `Resend OTP in ${otpTimeLeft}s`
)}


          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
          >
            {isSubmitting ? "Signing up..." : "Signup"}
          </button>
        )}

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <NavLink to="/login" className="text-blue-600 hover:underline">
            Login here
          </NavLink>
        </p>
      </form>
    </div>
  );
}

export default Signup;
