'use client';

import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import Script from 'next/script';
import { Play, Lock, CheckCircle, HelpCircle, Send, ArrowLeft, Loader, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  isPremium: boolean;
  category: string;
}

interface Lesson {
  _id: string;
  title: string;
  youtubeId: string;
  description?: string;
  isPremium: boolean;
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  
  // User Auth & Access State
  const [user, setUser] = useState<{ id: string; role: string; isPro: boolean } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);

  // Progress Tracking
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // AI Chatbot
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: 'Hi! Ask me anything about this course, and I will try to help you study!' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    // Get user
    const savedUser = localStorage.getItem('user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    setUser(parsedUser);

    // Fetch Course details
    const fetchData = async () => {
      try {
        const courseRes = await axios.get(`/api/courses/${courseId}`);
        setCourse(courseRes.data);

        // Check Access
        const userHasAccess = !courseRes.data.isPremium || (parsedUser && parsedUser.isPro);
        setHasAccess(!!userHasAccess);

        if (userHasAccess) {
          // Fetch lessons
          const lessonsRes = await axios.get(`/api/courses/${courseId}/lessons`);
          setLessons(lessonsRes.data);
          if (lessonsRes.data.length > 0) {
            setActiveLesson(lessonsRes.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // Handle mock Razorpay transaction
  const handleUnlockCourse = async () => {
    if (!user) {
      alert('Please login to purchase courses.');
      window.location.href = '/auth/login';
      return;
    }

    setUnlockLoading(true);
    try {
      // 1. Create Order on backend
      const token = localStorage.getItem('token');
      const orderRes = await axios.post('/api/payments/create-order', 
        { itemId: courseId, itemType: 'course', amount: course?.price || 499 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderData = orderRes.data;

      // 2. Trigger Razorpay checkout
      const options = {
        key: 'rzp_test_mockKeyId123456', // Test key
        amount: orderData.amount,
        currency: 'INR',
        name: 'EduYodha Educational Platform',
        description: `Purchase Course: ${course?.title}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await axios.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || 'mock_signature'
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (verifyRes.data.success) {
              alert('Payment Successful! Course Unlocked.');
              
              // Update local user details to be pro
              const updatedUser = { ...user, isPro: true };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
              window.dispatchEvent(new Event('user-state-change'));

              // Refresh page data
              setHasAccess(true);
              const lessonsRes = await axios.get(`/api/courses/${courseId}/lessons`);
              setLessons(lessonsRes.data);
              if (lessonsRes.data.length > 0) {
                setActiveLesson(lessonsRes.data[0]);
              }
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            alert('Verification failed. Contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#2563EB',
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      // Fallback: Simulator mode for testing
      const confirmUnlock = window.confirm('Razorpay script not fully initialized or offline. Would you like to use Simulator Mode to unlock this course instantly for free?');
      if (confirmUnlock && user) {
        // Mock success API call to unlock
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/payments/verify', {
            razorpay_order_id: 'mock_order_123',
            razorpay_payment_id: 'mock_pay_123',
            razorpay_signature: 'mock_sig_123',
            simulate: true
          }, { headers: { Authorization: `Bearer ${token}` } });

          // Update user isPro status
          const updatedUser = { ...user, isPro: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          window.dispatchEvent(new Event('user-state-change'));

          alert('Simulator Unlock Successful!');
          setHasAccess(true);
          const lessonsRes = await axios.get(`/api/courses/${courseId}/lessons`);
          setLessons(lessonsRes.data);
          if (lessonsRes.data.length > 0) {
            setActiveLesson(lessonsRes.data[0]);
          }
        } catch (simErr) {
          console.error(simErr);
        }
      }
    } finally {
      setUnlockLoading(false);
    }
  };

  // Chatbot submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);

    try {
      // Simple custom response simulator or backend chat hit
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let botResponse = `I am your study assistant for "${course?.title}". Regarding your question: "${userText}", please make sure to check the video lesson timestamps or syllabus nodes!`;
      
      const textUpper = userText.toUpperCase();
      if (textUpper.includes('HELLO') || textUpper.includes('HI')) {
        botResponse = 'Hello! How can I assist you with your machine learning lessons today?';
      } else if (textUpper.includes('WHAT IS MACHINE LEARNING') || textUpper.includes('ML')) {
        botResponse = 'Machine learning is a field of AI that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. In Kannada: Introduction, definition and examples are explained in Lesson 1!';
      } else if (textUpper.includes('DIKW') || textUpper.includes('PYRAMID')) {
        botResponse = 'The DIKW model stands for Data, Information, Knowledge, and Wisdom. It represents the transition of raw data into information, then knowledge, and finally wisdom. Check out Lesson 3 for a full breakdown!';
      } else if (textUpper.includes('OVERFITTING') || textUpper.includes('CHALLENGE')) {
        botResponse = 'Overfitting happens when a model learns the detail and noise in the training data to the extent that it negatively impacts the performance of the model on new data. Check out the Challenges of Machine Learning lesson!';
      }

      setChatHistory(prev => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  const toggleLessonProgress = (lessonId: string) => {
    setCompletedLessons(prev => {
      if (prev.includes(lessonId)) {
        return prev.filter(id => id !== lessonId);
      } else {
        return [...prev, lessonId];
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2">
        <Loader className="animate-spin text-blue-600" size={32} />
        <span className="text-sm font-semibold text-slate-500">Loading course curriculum...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h3 className="text-xl font-bold">Course not found</h3>
        <Link href="/courses" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link href="/courses" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6">
          <ArrowLeft size={14} />
          <span>Back to Courses</span>
        </Link>

        {!hasAccess ? (
          /* BLOCKED PREMIUM PAGE - Checkout options */
          <div className="max-w-3xl mx-auto bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
            
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500" />
            
            <span className="text-4xl inline-block mb-4">🔒</span>
            <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Premium Course</span>
            <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 mb-4">{course.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold max-w-lg mx-auto mb-8 leading-relaxed">
              This course contains exclusive lectures and advanced lessons. Upgrade your account or purchase the course to unlock full access.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 max-w-sm mx-auto mb-8">
              <span className="block text-xs font-bold text-slate-400 uppercase">One-time Investment</span>
              <div className="flex justify-center items-baseline gap-2 mt-2">
                <span className="text-slate-400 line-through text-sm">₹999</span>
                <span className="text-3xl font-black text-amber-500">₹{course.price}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-semibold flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-emerald-500" /> Secure checkout with Razorpay UPI & Cards
              </p>
            </div>

            <button
              onClick={handleUnlockCourse}
              disabled={unlockLoading}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer transition-all disabled:opacity-60 uppercase text-xs tracking-wider"
            >
              {unlockLoading ? 'Processing Checkout...' : 'Unlock Full Course'}
            </button>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-850 pt-8 max-w-md mx-auto text-left text-xs text-slate-500">
              <div className="flex flex-col gap-1.5">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Sparkles size={12} className="text-amber-500" /> Full Access</span>
                <span className="text-[10px]">All lessons unlocked</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Sparkles size={12} className="text-amber-500" /> Progress</span>
                <span className="text-[10px]">Track study scores</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Sparkles size={12} className="text-amber-500" /> AI Bot</span>
                <span className="text-[10px]">24/7 study chatbot</span>
              </div>
            </div>
            
          </div>
        ) : (
          /* ACTIVE COURSE CURRICULUM & PLAYER */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Player + Chatbot */}
            <div className="lg:col-span-2 flex flex-col gap-6 text-left">
              
              {/* Player Video Card */}
              <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-3">{course.title}</h2>
                
                {activeLesson ? (
                  <div className="flex flex-col gap-4">
                    {/* Embedded Youtube Player */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800">
                      <iframe
                        src={`https://www.youtube.com/embed/${activeLesson.youtubeId}?autoplay=0&rel=0`}
                        title={activeLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-none"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                        <Play size={14} className="text-blue-500" />
                        <span>{activeLesson.title}</span>
                      </h3>
                      {activeLesson.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold leading-relaxed">
                          {activeLesson.description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500">No lessons seeded for this course.</div>
                )}
              </div>

              {/* Study Chatbot Widget */}
              <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col h-[350px]">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-850">
                  <HelpCircle size={16} className="text-blue-500" />
                  <span>AI Study Assistant</span>
                </h3>
                
                {/* Chat Message Box */}
                <div className="flex-grow overflow-y-auto py-3 flex flex-col gap-3">
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-3 text-xs font-semibold ${
                        chat.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-tl-none'
                      }`}>
                        {chat.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-855 text-slate-400 rounded-2xl p-3 text-xs font-semibold rounded-tl-none animate-pulse">
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                  <input
                    type="text"
                    placeholder="Ask a question about this course..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-grow p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>

            </div>

            {/* Right Side: Curriculum Playlist & Progress */}
            <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col h-full text-left">
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 mb-2">Course Playlist</h3>
              
              {/* Progress stats */}
              <div className="mb-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1">
                  <span>Course Progress</span>
                  <span>
                    {lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="block text-[10px] text-slate-400 font-semibold mt-1">
                  {completedLessons.length} of {lessons.length} lessons completed
                </span>
              </div>

              {/* Playlist container */}
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px]">
                {lessons.map((lesson, idx) => {
                  const isActive = activeLesson?._id === lesson._id;
                  const isDone = completedLessons.includes(lesson._id);

                  return (
                    <div
                      key={lesson._id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold shadow-sm'
                          : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs truncate font-bold">{lesson.title}</span>
                      </div>
                      
                      {/* Completion check */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLessonProgress(lesson._id);
                        }}
                        className={`p-1 rounded-full cursor-pointer transition-colors ${
                          isDone ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'
                        }`}
                        title="Mark Completed"
                      >
                        <CheckCircle size={16} fill={isDone ? 'currentColor' : 'none'} className={isDone ? 'text-white bg-emerald-500 rounded-full' : ''} />
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}
      </div>
    </>
  );
}
