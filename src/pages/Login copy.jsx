import React, { useState, useEffect, useRef } from 'react';

// Animation keyframes - would be in your CSS in a real application
const animationStyles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes blob {
    0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-pulse { animation: pulse 3s ease-in-out infinite; }
  .animate-rotate { animation: rotate 12s linear infinite; }
  .animate-blob { animation: blob 8s ease-in-out infinite; }
  .delay-2s { animation-delay: 2s; }
  .delay-4s { animation-delay: 4s; }
  
  .bg-mesh {
    background-image: radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2%, transparent 0%), 
                      radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.2) 2%, transparent 0%);
    background-size: 100px 100px;
  }
`;

const Login = () => {
  // State management
  const [activeTab, setActiveTab] = useState('signin'); // signin or signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark'); // dark or light
  const [authMethod, setAuthMethod] = useState('password'); // password, 2fa, fingerprint, face
  const [step, setStep] = useState(1); // For multi-step authentication
  const [verificationCode, setVerificationCode] = useState('');
  const [language, setLanguage] = useState('en');
  const [errorMessages, setErrorMessages] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Refs for interactive elements
  const canvasRef = useRef(null);
  const loginFormRef = useRef(null);
  const codeInputRefs = useRef([...Array(6)].map(() => React.createRef()));
  
  // Password strength calculator
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length > 6) strength += 1;
    if (password.length > 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);

  // Canvas animation for background
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        velocity: {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5
        }
      });
    }
    
    const connect = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = theme === 'dark' 
              ? `rgba(255, 255, 255, ${1 - distance / 120})` 
              : `rgba(0, 0, 0, ${1 - distance / 120})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        
        if (p.x < 0 || p.x > canvas.width) p.velocity.x = -p.velocity.x;
        if (p.y < 0 || p.y > canvas.height) p.velocity.y = -p.velocity.y;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      
      connect();
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme]);

  // Form animation on mount
  useEffect(() => {
    if (loginFormRef.current) {
      loginFormRef.current.style.opacity = '0';
      loginFormRef.current.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        if (loginFormRef.current) {
          loginFormRef.current.style.opacity = '1';
          loginFormRef.current.style.transform = 'translateY(0)';
        }
      }, 100);
    }
  }, []);
  
  // Handle form code input (for 2FA verification)
  const handleCodeChange = (value, index) => {
    const codeArray = verificationCode.split('');
    codeArray[index] = value;
    setVerificationCode(codeArray.join(''));
    
    // Auto focus on next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1].current.focus();
    }
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    
    if (activeTab === 'signup') {
      if (!name) errors.name = 'Name is required';
      if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    
    setErrorMessages(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle sign in
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    if (loginAttempts >= 2 && step === 1) {
      // Simulate requiring additional verification after multiple attempts
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(2);
      setLoading(false);
      return;
    }
    
    if (step === 1 && authMethod === 'password') {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoginAttempts(prev => prev + 1);
      
      if (activeTab === 'signin') {
        // Email validation logic would go here
        if (authMethod === '2fa') {
          setStep(2);
          setLoading(false);
          return;
        }
      } else {
        // Sign up logic
        setStep(1);
        setActiveTab('signin');
        setLoading(false);
        return;
      }
    } else if (step === 2) {
      // Validate 2FA code
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (verificationCode.length !== 6) {
        setErrorMessages({verificationCode: 'Please enter a valid code'});
        setLoading(false);
        return;
      }
    } else if (authMethod === 'fingerprint' || authMethod === 'face') {
      // Biometric authentication simulation
      setShowBiometricPrompt(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowBiometricPrompt(false);
    }
    
    // Simulate successful login animation
    setLoginSuccess(true);
    
    // Redirect or perform action on successful login
    setTimeout(() => {
      console.log('Logged in with:', { 
        email, password, rememberMe, 
        method: authMethod, 
        verificationCode: step === 2 ? verificationCode : null 
      });
      setLoading(false);
    }, 1500);
  };
  
  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    setAuthMethod('fingerprint');
    setShowBiometricPrompt(true);
    
    // Simulate biometric authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowBiometricPrompt(false);
    
    // Simulate successful login
    setLoginSuccess(true);
    setTimeout(() => {
      console.log('Logged in with biometric authentication');
    }, 1500);
  };
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // Reset to first step
  const handleBack = () => {
    setStep(1);
    setVerificationCode('');
    setErrorMessages({});
  };
  
  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength < 2) return 'bg-red-500';
    if (passwordStrength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  // Get password strength text
  const getStrengthText = () => {
    if (passwordStrength < 2) return 'Weak';
    if (passwordStrength < 4) return 'Medium';
    return 'Strong';
  };
  
  // Render sign in form
  const renderSignInForm = () => (
    <form className="px-8 pb-8" onSubmit={handleSubmit}>
      <div className="mb-6 relative">
        <div className={`flex items-center border-b-2 ${isEmailFocused ? 'border-blue-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} transition-colors duration-300`}>
          <svg className={`w-5 h-5 mr-3 ${isEmailFocused ? 'text-blue-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input 
            type="email" 
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            className={`w-full py-3 bg-transparent ${theme === 'dark' ? 'text-white' : 'text-gray-800'} placeholder-gray-400 outline-none`}
            placeholder={isEmailFocused ? "" : "Email Address"}
            required
          />
          <label 
            htmlFor="email" 
            className={`absolute left-8 text-sm transition-all duration-300 pointer-events-none ${
              isEmailFocused || email 
                ? 'transform -translate-y-6 text-blue-500 text-xs' 
                : 'transform translate-y-0 text-gray-400'
            }`}
          >
            {isEmailFocused || email ? "Email Address" : ""}
          </label>
        </div>
        {errorMessages.email && (
          <p className="mt-2 text-xs text-red-500">
            <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessages.email}
          </p>
        )}
      </div>
      
      <div className="mb-6 relative">
        <div className={`flex items-center border-b-2 ${isPasswordFocused ? 'border-blue-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} transition-colors duration-300`}>
          <svg className={`w-5 h-5 mr-3 ${isPasswordFocused ? 'text-blue-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input 
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            className={`w-full py-3 bg-transparent ${theme === 'dark' ? 'text-white' : 'text-gray-800'} placeholder-gray-400 outline-none`}
            placeholder={isPasswordFocused ? "" : "Password"}
            required
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="focus:outline-none"
          >
            {showPassword ? (
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          <label 
            htmlFor="password" 
            className={`absolute left-8 text-sm transition-all duration-300 pointer-events-none ${
              isPasswordFocused || password 
                ? 'transform -translate-y-6 text-blue-500 text-xs' 
                : 'transform translate-y-0 text-gray-400'
            }`}
          >
            {isPasswordFocused || password ? "Password" : ""}
          </label>
        </div>
        
        {/* Password strength meter */}
        {password && (
          <div className="mt-2">
            <div className="flex space-x-1 mb-1">
              <div className={`h-1 w-1/5 rounded-full ${passwordStrength >= 1 ? getStrengthColor() : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-1/5 rounded-full ${passwordStrength >= 2 ? getStrengthColor() : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-1/5 rounded-full ${passwordStrength >= 3 ? getStrengthColor() : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-1/5 rounded-full ${passwordStrength >= 4 ? getStrengthColor() : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-1/5 rounded-full ${passwordStrength >= 5 ? getStrengthColor() : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex justify-between text-xs">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {getStrengthText()}
              </span>
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {passwordStrength}/5
              </span>
            </div>
          </div>
        )}
        
        {errorMessages.password && (
          <p className="mt-2 text-xs text-red-500">
            <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessages.password}
          </p>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input 
              type="checkbox" 
              id="remember-me" 
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="sr-only"
            />
            <div className={`w-10 h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-full shadow-inner`}></div>
            <div 
              className={`absolute w-6 h-6 rounded-full transition-transform duration-300 transform ${rememberMe ? 'translate-x-full bg-blue-500' : 'translate-x-0 bg-gray-400'} -translate-y-1`}>
            </div>
          </div>
          <label htmlFor="remember-me" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} select-none`}>Remember me</label>
        </div>
        <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-300">Forgot password?</a>
      </div>
      
      <div className="space-y-4">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </div>
          ) : "Sign in"}
        </button>
        
        <div className="relative flex items-center my-4">
          <div className={`flex-grow border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}></div>
          <span className={`flex-shrink mx-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>OR</span>
          <div className={`flex-grow border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}></div>
        </div>
        
        <button 
          type="button"
          onClick={handleBiometricAuth}
          className={`w-full flex items-center justify-center py-3 px-4 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} rounded-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'} font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300`}
        >
          <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Sign in with biometrics
        </button>
      </div>
    </form>
  );
  
  // Render sign up form
  const renderSignUpForm = () => (
    <form className="px-8 pb-8" onSubmit={handleSubmit}>
      <div className="mb-6 relative">
        <div className={`flex items-center border-b-2 ${isNameFocused ? 'border-blue-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} transition-colors duration-300`}>
          <svg className={`w-5 h-5 mr-3 ${isNameFocused ? 'text-blue-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input 
            type="text" 
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            className={`w-full py-3 bg-transparent ${theme === 'dark' ? 'text-white' : 'text-gray-800'} placeholder-gray-400 outline-none`}
            placeholder={isNameFocused ? "" : "Full Name"}
            required
          />
          <label 
            htmlFor="name" 
            className={`absolute left-8 text-sm transition-all duration-300 pointer-events-none ${
              isNameFocused || name 
                ? 'transform -translate-y-6 text-blue-500 text-xs' 
                : 'transform translate-y-0 text-gray-400'
            }`}
          >
            {isNameFocused || name ? "Full Name" : ""}
          </label>
        </div>
        {errorMessages.name && (
          <p className="mt-2 text-xs text-red-500">
            <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessages.name}
          </p>
        )}
      </div>
      
      {/* Same email field as signin form */}
      <div className="mb-6 relative">
        <div className={`flex items-center border-b-2 ${isEmailFocused ? 'border-blue-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} transition-colors duration-300`}>
          <svg className={`w-5 h-5 mr-3 ${isEmailFocused ? 'text-blue-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input 
            type="email" 
            id="signup-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            className={`w-full py-3 bg-transparent ${theme === 'dark' ? 'text-white' : 'text-gray-800'} placeholder-gray-400 outline-none`}
            placeholder={isEmailFocused ? "" : "Email Address"}
            required
          />
          <label 
            htmlFor="signup-email" 
            className={`absolute left-8 text-sm transition-all duration-300 pointer-events-none ${
              isEmailFocused || email 
                ? 'transform -translate-y-6 text-blue-500 text-xs' 
                : 'transform translate-y-0 text-gray-400'
            }`}
          >
            {isEmailFocused || email ? "Email Address" : ""}
          </label>
        </div>
        {errorMessages.email && (
          <p className="mt-2 text-xs text-red-500">
            <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessages.email}
          </p>
        )}
      </div>
      
      {/* Password field similar to signin */}
      <div className="mb-6 relative">
        <div className={`flex items-center border-b-2 ${isPasswordFocused ? 'border-blue-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} transition-colors duration-300`}>
          <svg className={`w-5 h-5 mr-3 ${isPasswordFocused ? 'text-blue-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input 
            type={showPassword ? "text" : "password"}
            id="signup-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            className={`w-full py-3 bg-transparent ${theme === 'dark' ? 'text-white' : 'text-gray-800'} placeholder-gray-400 outline-none`}
            placeholder={isPasswordFocused ? "" : "Password"}
            required
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="focus:outline-none"
          >
            {showPassword ? (
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          <label 
            htmlFor="signup-password" 
            className={`absolute left-8 text-sm transition-all duration-300 pointer-events-none ${
              isPasswordFocused || password 
                ? 'transform -translate-y-6 text-blue-500 text-xs' 
                : 'transform translate-y-0 text-gray-400'
            }`}
          >
            {isPasswordFocused || password ? "Password" : ""}
          </label>
        </div>
        
        {/* Password strength meter - same as signin */}
        {password && (
          <div className="mt-2">
            <div className="flex space-x-1 mb-1">
              <div className={`h-1 w-1/5 rounded-full ${passwordStrength >= 1 ? getStrengthColor() : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-1/5 rounded-full ${passwordStrength >= 2 ? getStrengthColor() : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-1/5 rounded-full ${passwordStrength >= 3 ? getStrengthColor() : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-1/5 rounded-full ${passwordStrength >= 4 ? getStrengthColor() : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-1 w-1/5 rounded-full ${passwordStrength >= 5 ? getStrengthColor() : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex justify-between text-xs">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {getStrengthText()}
              </span>
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {passwordStrength}/5
              </span>
            </div>
          </div>
        )}
        
        {errorMessages.password && (
          <p className="mt-2 text-xs text-red-500">
            <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessages.password}
          </p>
        )}
      </div>
      
      <div className="mb-6 relative">
        <div className={`flex items-center border-b-2 ${isConfirmPasswordFocused ? 'border-blue-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} transition-colors duration-300`}>
          <svg className={`w-5 h-5 mr-3 ${isConfirmPasswordFocused ? 'text-blue-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <input 
            type={showPassword ? "text" : "password"}
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setIsConfirmPasswordFocused(true)}
            onBlur={() => setIsConfirmPasswordFocused(false)}
            className={`w-full py-3 bg-transparent ${theme === 'dark' ? 'text-white' : 'text-gray-800'} placeholder-gray-400 outline-none`}
            placeholder={isConfirmPasswordFocused ? "" : "Confirm Password"}
            required
          />
          <label 
            htmlFor="confirm-password" 
            className={`absolute left-8 text-sm transition-all duration-300 pointer-events-none ${
              isConfirmPasswordFocused || confirmPassword 
                ? 'transform -translate-y-6 text-blue-500 text-xs' 
                : 'transform translate-y-0 text-gray-400'
            }`}
          >
            {isConfirmPasswordFocused || confirmPassword ? "Confirm Password" : ""}
          </label>
        </div>
        {errorMessages.confirmPassword && (
          <p className="mt-2 text-xs text-red-500">
            <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessages.confirmPassword}
          </p>
        )}
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </div>
        ) : "Create account"}
      </button>
    </form>
  );
  
  // Render 2FA verification step
  const render2FAVerification = () => (
    <div className="px-8 pb-8">
      <div className="mb-6 text-center">
        <div className="inline-block p-3 rounded-full bg-blue-500 bg-opacity-10 mb-4">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>
        <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Two-Factor Authentication</h3>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          We sent a verification code to your email {email.substring(0, 3)}***{email.substring(email.indexOf('@'))}
        </p>
      </div>
      
      <div className="mb-8">
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Enter the 6-digit code
        </label>
        <div className="flex justify-between gap-2">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              ref={codeInputRefs.current[i]}
              type="text"
              maxLength={1}
              className={`w-full h-12 text-center text-lg font-bold rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'} border`}
              value={verificationCode[i] || ''}
              onChange={(e) => handleCodeChange(e.target.value, i)}
            />
          ))}
        </div>
        {errorMessages.verificationCode && (
          <p className="mt-2 text-xs text-red-500">
            <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessages.verificationCode}
          </p>
        )}
      </div>
      
      <div className="flex flex-col space-y-4">
        <button 
          type="button" 
          onClick={handleSubmit}
          disabled={loading || verificationCode.length !== 6}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </div>
          ) : "Verify"}
        </button>
        
        <button 
          type="button"
          onClick={handleBack}
          className={`w-full py-3 px-4 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300`}
        >
          Back
        </button>
        
        <div className="text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Didn't receive the code?{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-300">Resend</a>
          </p>
        </div>
      </div>
    </div>
  );
  
  // Render biometric authentication prompt
  const renderBiometricPrompt = () => (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`w-80 rounded-xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} p-6 transform transition-all duration-300 animate-float`}>
        <div className="text-center">
          <div className="inline-block p-4 rounded-full bg-blue-500 bg-opacity-10 mb-4">
            <svg className="w-12 h-12 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Biometric Authentication</h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            {authMethod === 'fingerprint' ? 'Place your finger on the sensor' : 'Look at the camera for face recognition'}
          </p>
          
          <div className="relative mb-6">
            {authMethod === 'fingerprint' ? (
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
                <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
            ) : (
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
                <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-500">
              Scanning...
            </div>
          </div>
          
          <button 
            onClick={() => setShowBiometricPrompt(false)}
            className={`w-full py-2 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} rounded-lg font-medium transition-colors duration-300`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
  
  // Render success animation
  const renderSuccessAnimation = () => (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white mb-8">
          <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-white mb-2 animate-pulse">Login Successful!</h3>
        <p className="text-white text-opacity-90">Redirecting to your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Custom CSS for animations */}
      <style>{animationStyles}</style>
      
      {/* Background canvas animation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
      
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={toggleTheme} 
          className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-yellow-300' : 'bg-white text-gray-800'} shadow-lg transition-colors duration-300`}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      {/* Language selector */}
      <div className="absolute top-4 left-4 z-10">
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={`py-1 px-2 text-sm rounded-md ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'} border shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="zh">中文</option>
        </select>
      </div>
      
      <div className={`flex min-h-screen w-full ${theme === 'dark' ? 'bg-mesh' : ''}`}>
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Dynamic gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
          
          {/* Animated blobs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-2s"></div>
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-4s"></div>
          
          {/* 3D rotating geometric shape */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64 animate-rotate">
              <div className="absolute top-0 left-0 right-0 bottom-0 border-2 border-white border-opacity-20 rounded-lg transform rotate-45"></div>
              <div className="absolute top-8 left-8 right-8 bottom-8 border-2 border-white border-opacity-30 rounded-lg transform rotate-12"></div>
              <div className="absolute top-16 left-16 right-16 bottom-16 border-2 border-white border-opacity-40 rounded-lg transform -rotate-12"></div>
              <div className="absolute top-24 left-24 right-24 bottom-24 border-2 border-white border-opacity-50 rounded-lg transform -rotate-45"></div>
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-16">
            <div className="w-full max-w-md text-white">
              <div className="mb-8">
                <div className="inline-flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mr-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold">SecureApp</h1>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold mb-6">Experience next-level security</h2>
              <p className="text-xl mb-10 text-white text-opacity-90">The most advanced authentication system with cutting-edge security features and seamless user experience.</p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-white bg-opacity-10 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Biometric Authentication</h3>
                    <p className="text-white text-opacity-80">Secure your account with fingerprint or face recognition</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-white bg-opacity-10 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <p className="text-white text-opacity-80">Add an extra layer of security with 2FA verification</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-white bg-opacity-10 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Lightning Fast</h3>
                    <p className="text-white text-opacity-80">Optimized performance for instant authentication</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
          <div className="w-full max-w-md" ref={loginFormRef} style={{ transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
            <div className={`backdrop-blur-md ${theme === 'dark' ? 'bg-black/30' : 'bg-white/70'} rounded-2xl shadow-2xl overflow-hidden border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} transition-all duration-300`}>
              {/* Header with tabs */}
              <div className={`px-8 pt-8 pb-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                {step === 1 && (
                  <div className="flex space-x-2 mb-6">
                    <button
                      onClick={() => setActiveTab('signin')}
                      className={`flex-1 py-2 text-center rounded-lg transition-all duration-300 ${
                        activeTab === 'signin'
                          ? `${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme === 'dark' ? 'text-white' : 'text-gray-800'} shadow-md`
                          : `${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:text-blue-500`
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setActiveTab('signup')}
                      className={`flex-1 py-2 text-center rounded-lg transition-all duration-300 ${
                        activeTab === 'signup'
                          ? `${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme === 'dark' ? 'text-white' : 'text-gray-800'} shadow-md`
                          : `${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:text-blue-500`
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                )}
                
                <div className="mb-6 flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-600 flex items-center justify-center">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                
                <h2 className={`text-3xl font-bold text-center mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {step === 1 
                    ? (activeTab === 'signin' ? 'Welcome back' : 'Create account') 
                    : 'Verify your identity'}
                </h2>
                <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step === 1 
                    ? (activeTab === 'signin' ? 'Enter your credentials to access your account' : 'Fill in your information to get started') 
                    : 'Complete the verification to secure your account'}
                </p>
              </div>

              {/* Social Login Options */}
              {step === 1 && (
                <div className="px-8 py-6">
                  <div className="grid grid-cols-3 gap-3">
                    <button className={`flex justify-center items-center py-2 px-4 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} rounded-lg transition duration-300`}>
                      <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                      </svg>
                    </button>
                    <button className={`flex justify-center items-center py-2 px-4 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} rounded-lg transition duration-300`}>
                      <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button className={`flex justify-center items-center py-2 px-4 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} rounded-lg transition duration-300`}>
                      <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="relative flex items-center my-6">
                    <div className={`flex-grow border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}></div>
                    <span className={`flex-shrink mx-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>or continue with</span>
                    <div className={`flex-grow border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}></div>
                  </div>
                </div>
              )}
              
              {/* Form based on step and tab */}
              {step === 1 && activeTab === 'signin' && renderSignInForm()}
              {step === 1 && activeTab === 'signup' && renderSignUpForm()}
              {step === 2 && render2FAVerification()}
              
              {/* Footer */}
              <div className={`p-8 ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-50'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {step === 1 ? (
                    activeTab === 'signin' ? (
                      <>
                        Don't have an account?{' '}
                        <a 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab('signup');
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                        >
                          Create account
                        </a>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <a 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab('signin');
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                        >
                          Sign in
                        </a>
                      </>
                    )
                  ) : (
                    'Secure authentication powered by SecureApp'
                  )}
                </p>
                <div className="mt-6 flex justify-center">
                  <a href="#" className={`text-xs ${theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'} mx-3 transition-colors duration-300`}>Terms & Conditions</a>
                  <a href="#" className={`text-xs ${theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'} mx-3 transition-colors duration-300`}>Privacy Policy</a>
                  <a href="#" className={`text-xs ${theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'} mx-3 transition-colors duration-300`}>Help Center</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Biometric authentication modal */}
      {showBiometricPrompt && renderBiometricPrompt()}
      
      {/* Success animation */}
      {loginSuccess && renderSuccessAnimation()}
    </div>
  );
};

export default Login;