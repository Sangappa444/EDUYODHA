'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';
import { Search, Download, Lock, CheckCircle, FileText, Sparkles, AlertTriangle } from 'lucide-react';

interface PdfItem {
  _id: string;
  title: string;
  description: string;
  url: string;
  category: 'vtu-notes' | 'kcet-materials' | 'other';
  semester?: number;
  price: number;
  isPremium: boolean;
}

export default function PdfStorePage() {
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [user, setUser] = useState<{ id: string; role: string; isPro: boolean } | null>(null);
  const [buyLoading, setBuyLoading] = useState<string | null>(null);

  useEffect(() => {
    // Get user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Fetch PDFs
    axios.get('/api/pdf')
      .then(res => {
        setPdfs(res.data);
      })
      .catch(err => {
        console.error('Error fetching PDFs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDownload = (pdf: PdfItem) => {
    const hasAccess = !pdf.isPremium || user?.isPro;
    if (!hasAccess) {
      alert('This is a premium PDF. Please purchase or unlock pro membership to download.');
      return;
    }
    // For local simulation, we open standard pdf link or mock alert
    window.open(pdf.url, '_blank');
  };

  const handleUnlockPdf = async (pdfId: string, pdfTitle: string, pdfPrice: number) => {
    if (!user) {
      alert('Please login to purchase items.');
      window.location.href = '/auth/login';
      return;
    }

    setBuyLoading(pdfId);
    try {
      const token = localStorage.getItem('token');
      // Create Razorpay order
      const orderRes = await axios.post('/api/payments/create-order', 
        { itemId: pdfId, itemType: 'pdf', amount: pdfPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderData = orderRes.data;

      const options = {
        key: 'rzp_test_mockKeyId123456',
        amount: orderData.amount,
        currency: 'INR',
        name: 'EduYodha PDF Store',
        description: `Unlock Note: ${pdfTitle}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || 'mock_signature'
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (verifyRes.data.success) {
              alert('Payment Successful! PDF Access Unlocked.');
              
              // Upgrade user to Pro globally
              const updatedUser = { ...user, isPro: true };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
              window.dispatchEvent(new Event('user-state-change'));
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            alert('Verification failed.');
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
    } catch (err) {
      console.error('Razorpay fail, fallback to simulator:', err);
      // Fallback: Simulator mode
      const confirmUnlock = window.confirm(`Trigger payment simulator for ${pdfTitle}? This is a free mock checkout for local testing.`);
      if (confirmUnlock && user) {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/payments/verify', {
            razorpay_order_id: 'mock_order_123',
            razorpay_payment_id: 'mock_pay_123',
            razorpay_signature: 'mock_sig_123',
            simulate: true
          }, { headers: { Authorization: `Bearer ${token}` } });

          const updatedUser = { ...user, isPro: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          window.dispatchEvent(new Event('user-state-change'));
          alert('Note Unlocked successfully via Simulator!');
        } catch (simErr) {
          console.error(simErr);
        }
      }
    } finally {
      setBuyLoading(null);
    }
  };

  const filteredPdfs = pdfs.filter(pdf => {
    // Tab filter
    if (activeTab === 'vtu-notes' && pdf.category !== 'vtu-notes') return false;
    if (activeTab === 'kcet-materials' && pdf.category !== 'kcet-materials') return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toUpperCase();
      const matchTitle = pdf.title.toUpperCase().includes(query);
      const matchDesc = pdf.description.toUpperCase().includes(query);
      return matchTitle || matchDesc;
    }

    return true;
  });

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 bg-clip-text text-transparent mb-2">
            EduYodha PDF Store
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm font-semibold">
            Download VTU engineering semester notes, previous-year KCET cutoff lists, syllabus resources, and prep materials.
          </p>
        </header>

        {/* Controls Bar: Search & Tabs */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl mb-10">
          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'All', label: 'All Resources' },
              { id: 'vtu-notes', label: 'VTU Sem Notes' },
              { id: 'kcet-materials', label: 'KCET Materials' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-850'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search PDF files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Pro Promo Banner */}
        {user && !user.isPro && (
          <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/30 rounded-3xl p-5 gap-4 mb-10 text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <h4 className="text-sm font-extrabold text-amber-500">Upgrade to Pro Membership</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Unlock all premium courses, exclusive VTU notes, and custom KCET predicts instantly.</p>
              </div>
            </div>
            <button
              onClick={() => handleUnlockPdf('global_pro', 'EduYodha Pro Membership', 499)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shrink-0 cursor-pointer shadow-md shadow-amber-500/10 uppercase tracking-wide"
            >
              Get Pro - ₹499
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <span className="text-sm font-bold text-slate-500 animate-pulse">Loading study sheets...</span>
          </div>
        ) : filteredPdfs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0f172a]/20 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 max-w-md mx-auto">
            <FileText size={40} className="mx-auto text-slate-350 mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-355">No PDF files found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting search keywords or selecting other filter tabs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPdfs.map(pdf => {
              const hasAccess = !pdf.isPremium || user?.isPro;
              return (
                <div
                  key={pdf._id}
                  className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow flex flex-col justify-between hover:shadow-lg transition-all text-left"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold rounded uppercase tracking-wider">
                        {pdf.category.replace('-', ' ')}
                      </span>
                      {pdf.isPremium && (
                        <span className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                          <Sparkles size={10} /> Premium
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 mb-2 line-clamp-1 leading-snug">
                      {pdf.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                      {pdf.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-4 mt-auto">
                    <div>
                      {pdf.isPremium ? (
                        <span className="text-sm font-black text-amber-500">₹{pdf.price}</span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Free
                        </span>
                      )}
                    </div>

                    {hasAccess ? (
                      <button
                        onClick={() => handleDownload(pdf)}
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow transition-all uppercase tracking-wide"
                      >
                        <Download size={12} />
                        <span>Download</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnlockPdf(pdf._id, pdf.title, pdf.price)}
                        disabled={buyLoading === pdf._id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl cursor-pointer shadow transition-all disabled:opacity-60 uppercase tracking-wide"
                      >
                        {buyLoading === pdf._id ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <Lock size={12} />
                            <span>Unlock Note</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </>
  );
}
