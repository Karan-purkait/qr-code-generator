import React, { useEffect, useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc'; // Import Google icon
import { useAuth } from '../context/AuthContext'; // Adjust the path as necessary

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const auth = getAuth(); // Initialize auth

  // Redirect to dashboard if user is signed in
  useEffect(() => {
    if (!authLoading) {
      if (currentUser) {
        navigate('/dashboard');
      }
    }
  }, [currentUser, authLoading, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when registration starts

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      setSuccessMessage('Registration successful! Please check your email to verify your account.');

      // Sign out the user after sending the verification email
      await signOut(auth);

      // Navigate to the login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000); // 3000 milliseconds = 3 seconds

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message);
      console.error("Error during registration", error);
    } finally {
      setLoading(false); // Set loading to false after registration is complete
    }
  };

  // Function to handle Google registration
  const handleGoogleRegister = async () => {
    const provider = new GoogleAuthProvider(); // Initialize Google provider
    setLoading(true); // Set loading to true while signing in

    try {
      const result = await signInWithPopup(auth, provider); // Open Google sign-in popup
      const user = result.user;

      // Handle successful registration (e.g., navigate or store user info)
      setSuccessMessage('Google registration successful!');
      navigate('/dashboard'); // Navigate to dashboard after successful login
    } catch (error) {
      setError(error.message);
      console.error("Error during Google registration", error);
    } finally {
      setLoading(false); // Set loading to false after operation completes
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <motion.form 
        onSubmit={handleRegister}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
      >
        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">Create an Account</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
        <motion.input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="w-full p-4 border border-gray-300 rounded-lg mb-4" 
        />
        <motion.input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          className="w-full p-4 border border-gray-300 rounded-lg mb-8" 
        />
        
        <motion.button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg font-semibold" 
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Creating account...' : 'Register'} {/* Show loading message */}
        </motion.button>
      
        {/* Google Register Button */}
        <motion.button
          type="button"
          onClick={handleGoogleRegister} // Call the Google registration function
          className="w-full mt-6 bg-slate-100 text-black p-4 rounded-lg hover:bg-gray-200 transition-colors duration-150 shadow-lg flex items-center justify-center font-semibold"
          whileHover={{ scale: 1.05 }}
        >
          <FcGoogle className="mr-2 size-8" />
          Register with <span className="font-bold ml-1">Google</span>
        </motion.button>
      </motion.form>
    </div>
  );
}
