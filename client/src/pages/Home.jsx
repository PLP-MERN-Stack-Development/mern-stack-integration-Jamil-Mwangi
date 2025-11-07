import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Welcome to MERN Blog
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        A full-stack blog application built with MongoDB, Express.js, React, and Node.js. 
        Share your thoughts, read amazing posts, and connect with other writers.
      </p>
      
      <div className="space-x-4">
        <Link
          to="/posts"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Browse Posts
        </Link>
        
        {!isAuthenticated && (
          <Link
            to="/register"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Get Started
          </Link>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">📝 Write Posts</h3>
          <p className="text-gray-600">
            Create and publish your own blog posts with rich content and images.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">🔐 Secure Auth</h3>
          <p className="text-gray-600">
            Secure user authentication with JWT tokens and protected routes.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">💬 Engage</h3>
          <p className="text-gray-600">
            Comment on posts and interact with the community of readers and writers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;