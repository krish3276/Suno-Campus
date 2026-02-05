import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function About() {
  const stats = [
    { value: '50+', label: 'Partner Colleges' },
    { value: '10k+', label: 'Active Students' },
    { value: '100+', label: 'Campus Communities' },
    { value: '24/7', label: 'News & Updates' },
  ];

  const features = [
    {
      icon: '📰',
      title: 'Verified Campus News',
      description: 'Stay informed with reliable campus news, verified updates, and timely announcements from your college community.',
    },
    {
      icon: '🤝',
      title: 'Thriving Communities',
      description: 'Join clubs, interest groups, and connect with peers who share your passion. Build meaningful connections that last.',
    },
    {
      icon: '💼',
      title: 'Career & Growth',
      description: 'Discover internship opportunities, workshops, and career guidance to help you succeed in your professional journey.',
    },
  ];

  const journeySteps = [
    {
      number: '1',
      title: 'Stay Updated',
      description: 'Never miss an update. Get instant event notifications, campus announcements, or important alerts. SunoCampus brings the buzz straight to your pocket.',
      color: 'blue',
    },
    {
      number: '2',
      title: 'Connect & Collaborate',
      description: 'Find peers who share your visions. Join clubs, start discussions, or easily group projects. Our campus community features make collaboration seamless.',
      color: 'green',
    },
    {
      number: '3',
      title: 'Grow & Succeed',
      description: 'Access opportunities that shape your future. From internships to workshops, we connect you with resources that accelerate your personal and professional growth.',
      color: 'purple',
    },
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="inline-block">
                  <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
                    🎓 FOR EVERY STUDENT
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  The Voice of
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Your Campus
                  </span>
                </h1>
                
                <p className="text-lg text-gray-600 max-w-xl">
                  SunoCampus connects Tier 2 and Tier 3 colleges, bridging the information gap and empowering students with real opportunities, verified news, and a thriving community.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/"
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Explore Feed
                  </Link>
                  <button className="px-8 py-3 bg-white text-gray-700 rounded-lg font-medium border-2 border-gray-200 hover:border-blue-300 transition-all">
                    Read Our Story
                  </button>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800"
                    alt="Students collaboration"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20"></div>
                </div>
                
                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Real-time Updates</p>
                      <p className="text-xs text-gray-500">Instant notifications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 mt-2 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Purpose</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We are building the largest marketplace for campus life in India
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Mission Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To democratize access to information and opportunity for every student, regardless of their pin code. We believe talent is distributed equally, but opportunity is not. SunoCampus is here to change that.
                </p>
              </div>

              {/* Vision Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To be the beating digital bridge for campus communities across India. Fostering connection, growth, and a unified student voice that cannot be ignored.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
                PLATFORM FEATURES
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2">
                Everything you need to succeed on campus
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Your Journey with SunoCampus
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From staying informed to building your career, we're with you every step
              </p>
            </div>

            <div className="space-y-12">
              {journeySteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } gap-8 items-center`}
                >
                  {/* Image Side */}
                  <div className="flex-1">
                    <div className="relative">
                      <div
                        className={`w-full h-64 bg-gradient-to-br ${
                          step.color === 'blue'
                            ? 'from-blue-100 to-blue-200'
                            : step.color === 'green'
                            ? 'from-green-100 to-green-200'
                            : 'from-purple-100 to-purple-200'
                        } rounded-2xl flex items-center justify-center`}
                      >
                        <div
                          className={`w-32 h-32 ${
                            step.color === 'blue'
                              ? 'bg-blue-500'
                              : step.color === 'green'
                              ? 'bg-green-500'
                              : 'bg-purple-500'
                          } rounded-full flex items-center justify-center text-white text-6xl font-bold`}
                        >
                          {step.number}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="flex-1">
                    <div
                      className={`inline-block px-4 py-2 ${
                        step.color === 'blue'
                          ? 'bg-blue-100 text-blue-600'
                          : step.color === 'green'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-purple-100 text-purple-600'
                      } rounded-full text-sm font-semibold mb-4`}
                    >
                      Step {step.number}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to be part of the change?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of students from Tier 2 and Tier 3 colleges who are already shaping their future with SunoCampus
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/"
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
                >
                  Explore Feed
                </Link>
                <button className="px-8 py-3 bg-transparent text-white rounded-lg font-semibold border-2 border-white hover:bg-white hover:text-blue-600 transition-all">
                  Download App
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-white font-semibold mb-4">Platform</h4>
                <ul className="space-y-2">
                  <li><Link to="/" className="hover:text-white transition-colors">NewsFeed</Link></li>
                  <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Communities</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Opportunities</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Connect</h4>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <span className="sr-only">Twitter</span>
                    𝕏
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <span className="sr-only">LinkedIn</span>
                    in
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                    <span className="sr-only">Instagram</span>
                    📷
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm">
              <p>© 2026 SunoCampus. All rights reserved.</p>
              <p className="mt-2 text-gray-500">Empowering campus life, one student at a time.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
