import React, { useState } from "react";
import { Link, Links } from 'react-router-dom'

export default function Login() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // here you will call backend API
  };

  return (
    <>
      <div className="bg-gray-200 w-[100vw] h-[100vh] flex justify-center items-center text-gray-500 font-sans">

        <div className="flex md:w-[55rem] md:min-h-[40rem] rounded-[1.75rem] bg-white shadow-2xl">
          <div className="md:left hidden md:flex md:items-center md:justify-center md:bg-[#eef2ff] md:rounded-l-[1.75rem]">
            <img src="/images/reg-img.png" alt="Registration illustration" className="max-h-[18rem] object-contain" />
          </div>
          <div className="right flex items-center justify-center">

            <div className="float-end p-6 sm:w-[25rem] h-full  md:rounded-r-[1.75rem] bg-white shadow-2xl">
              <h2 className="text-2xl font-semibold text-gray-600 text-center mb-6">
                Login
              </h2>

              <form onSubmit={handleSubmit} className="space-y-2 md:space-y-5">

                {/* Username */}
                <div className="flex flex-col">
                  <label className="mb-1">User Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-transparent border  border-[#2e4052] px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                    required
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-transparent border border-[#2e4052] px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                    required
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col">
                  <label className="mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-transparent border border-[#2e4052] px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                    required
                  />
                </div>

                {/* Button */}
                <div className="flex justify-center pt-8">
                  <Link to="/">
                    <button
                      type="submit" className="px-6 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-md shadow-xl hover:scale-105 transition">
                      Login
                    </button>
                  </Link>
                </div>
                <p>
                  Don't have an account?
                  <Link to="/register" className="pl-2 text-blue-600 underline hover:text-blue-800">Register here</Link>
                </p>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
