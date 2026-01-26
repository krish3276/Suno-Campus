import React, { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    college: "",
    branch: "",
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
          <div className="md:left hidden md:flex md:items-center md:justify-center md:bg-[#eef2ff]  md:rounded-l-[1.75rem]">
            <img src="/images/reg-img.png" alt="Registration illustration" className="max-h-[18rem] object-contain" />
          </div>

          <div className="right float-end p-6 sm:w-[25rem]  md:rounded-r-[1.75rem] bg-white shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">
              Registration Form
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
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-transparent border border-[#2e4052] px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                  required
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col">
                <label className="mb-2">Gender</label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      onChange={handleChange}
                      required
                    />
                    <span>Male</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      onChange={handleChange}
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              {/* College */}
              <div className="flex flex-col">
                <label className="mb-1">College Name</label>
                <input
                  type="text"
                  name="college"
                  placeholder="College name"
                  value={formData.college}
                  onChange={handleChange}
                  className="bg-transparent border border-[#2e4052] px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                  required
                />
              </div>

              {/* Branch */}
              <div className="flex flex-col">
                <label className="mb-1">Branch</label>
                <input
                  type="text"
                  name="branch"
                  placeholder="Branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="bg-transparent border border-[#2e4052] px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                  required
                />
              </div>

              {/* Button */}
              <div className="flex justify-center pt-3">
                <button
                  type="submit" className="px-6 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-md shadow-xl hover:scale-105 transition">
                  Register
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}
