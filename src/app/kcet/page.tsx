'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Compass, BookOpen, Download, Star, Trash, 
  ArrowUp, ArrowDown, SlidersHorizontal, 
  TrendingUp, HelpCircle, ChevronDown, ChevronUp, Check, X,
  Cpu, Leaf, Stethoscope, Pill, HeartPulse, 
  Activity, GraduationCap, Award
} from 'lucide-react';

interface PredictionRow {
  college_code: string;
  college_name: string;
  course_name: string;
  cutoff_rank: string;
  year: string;
  round: string;
  category: string;
  cutoff_rank_num?: number;
  chances?: 'Safe' | 'Moderate' | 'Tough';
}

interface TrendHistory {
  [year: string]: {
    [round: string]: number | null;
  };
}

export default function KcetPredictorPage() {
  const [rank, setRank] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['GM']);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('Engineering');
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [results, setResults] = useState<PredictionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [quotaRegion, setQuotaRegion] = useState<'RK' | 'HK'>('RK');
  
  // Custom states for premium features
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null); // 'college_code|course_name|category'
  const [trends, setTrends] = useState<{ [key: string]: TrendHistory }>({});
  const [trendsLoading, setTrendsLoading] = useState<{ [key: string]: boolean }>({});
  const [collegeTypeFilter, setCollegeTypeFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [sortBy, setSortBy] = useState('cutoff_asc');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // Custom states for search grids
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [isShowAllCourses, setIsShowAllCourses] = useState(false);
  
  // Cache state for instant PDF download
  const [cachedCutoffs, setCachedCutoffs] = useState<PredictionRow[]>([]);
  
  // FAQ state
  const [faqExpanded, setFaqExpanded] = useState<{ [key: number]: boolean }>({});

  const rkCategories = [
    '1G', '1K', '1R', '2AG', '2AK', '2AR', '2BG', '2BK', '2BR', 
    '3AG', '3AK', '3AR', '3BG', '3BK', '3BR', 
    'GM', 'GMK', 'GMR', 'SCG', 'SCK', 'SCR', 'STG', 'STK', 'STR'
  ];

  const hkCategories = [
    '1H', '1KH', '1RH', '2AH', '2AKH', '2ARH', '2BH', '2BKH', '2BRH', 
    '3AH', '3AKH', '3ARH', '3BH', '3BKH', '3BRH', 
    'GMH', 'GMKH', 'GMRH', 'SCH', 'SCKH', 'SCRH', 'STH', 'STKH', 'STRH'
  ];

  const admissionCategories = quotaRegion === 'RK' ? rkCategories : hkCategories;

  const categoryIcons: { [key: string]: React.ReactNode } = {
    'Engineering': <Cpu size={18} />,
    'Agriculture': <Leaf size={18} />,
    'Veterinary': <Award size={18} />,
    'B.Pharm': <Pill size={18} />,
    'D.Pharm': <Pill size={18} />,
    'B.Sc Nursing': <HeartPulse size={18} />,
    'BNYS': <Activity size={18} />,
    'Allied Health Sciences': <Stethoscope size={18} />,
    'BPT': <GraduationCap size={18} />,
    'BPO': <Stethoscope size={18} />,
    'Architecture': <Compass size={18} />
  };

  // Helper functions for parsed info
  const getCollegeType = (name: string) => {
    const uname = name.toUpperCase();
    if (uname.includes('GOVT') || uname.includes('GOVERNMENT') || uname.includes('UNIVERSITY') || uname.includes('UVCE')) return 'Government';
    if (uname.includes('AIDED')) return 'Aided';
    return 'Private';
  };

  const getCollegeCity = (name: string) => {
    if (name.includes(',,')) {
      return name.split(',,')[1].trim();
    }
    const parts = name.split(',');
    const cityPart = parts[parts.length - 1].trim();
    return cityPart.replace(/\./g, '').split(' ')[0];
  };

  // Load shortlist on mount
  useEffect(() => {
    const savedShortlist = localStorage.getItem('kcet_shortlist');
    if (savedShortlist) {
      try {
        setShortlist(JSON.parse(savedShortlist));
      } catch (e) {
        console.error('Error loading shortlist', e);
      }
    }
  }, []);

  // Sync categories list from backend
  useEffect(() => {
    axios.get('/api/kcet/categories')
      .then(res => setCategories(res.data))
      .catch(err => {
        console.error("Error fetching categories:", err);
        setCategories([
          'Engineering', 'Agriculture', 'Veterinary', 'B.Pharm', 'D.Pharm',
          'B.Sc Nursing', 'BNYS', 'Allied Health Sciences', 'BPT', 'BPO', 'Architecture'
        ]);
      });
  }, []);

  // Fetch contextual courses when admission stream changes
  useEffect(() => {
    axios.get('/api/kcet/courses', { params: { category: activeCategory } })
      .then(res => {
        setCourses(res.data);
        setSelectedCourses([]);
        setCourseSearchQuery('');
        setIsShowAllCourses(false);
      })
      .catch(err => console.error("Error fetching courses for category:", err));
  }, [activeCategory]);

  // Auto reset category selections when shifting regions
  const handleRegionChange = (region: 'RK' | 'HK') => {
    setQuotaRegion(region);
    const defaults = region === 'RK' ? ['GM'] : ['GMH'];
    setSelectedCategories(defaults);
    setResults([]);
    setSearched(false);
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rank || selectedCategories.length === 0) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      const response = await axios.get('/api/kcet/predict', {
        params: { 
          rank, 
          category: selectedCategories.join(','), 
          course_name: selectedCourses.join(','),
          course_category: activeCategory
        }
      });
      
      // Group by college_code + course_name + category to avoid duplicate cards for different years/rounds
      const uniqueResults: { [key: string]: PredictionRow } = {};
      response.data.forEach((row: PredictionRow) => {
        const key = `${row.college_code}|${row.course_name}|${row.category}`;
        if (!uniqueResults[key]) {
          uniqueResults[key] = row;
        } else {
          // Keep the latest record (2025 > 2024 > 2023, and Round 3 > Round 2 > Round 1)
          const current = uniqueResults[key];
          const currentYear = parseInt(current.year, 10) || 0;
          const rowYear = parseInt(row.year, 10) || 0;
          if (rowYear > currentYear) {
            uniqueResults[key] = row;
          } else if (rowYear === currentYear) {
            const currentRound = parseInt(current.round, 10) || 0;
            const rowRound = parseInt(row.round, 10) || 0;
            if (rowRound > currentRound) {
              uniqueResults[key] = row;
            }
          }
        }
      });
      
      const finalResults = Object.values(uniqueResults);
      setResults(finalResults);

      // Pre-fetch all cutoff history for PDF reports in the background
      if (finalResults.length > 0) {
        const uniqueCodes = Array.from(new Set(finalResults.map(r => r.college_code)));
        axios.get('/api/kcet/cutoffs', {
          params: {
            college_code: uniqueCodes.join(','),
            category: selectedCategories.join(','),
            course_category: activeCategory
          }
        }).then(res => {
          setCachedCutoffs(res.data);
        }).catch(err => {
          console.error("Background pre-fetch of cutoffs failed:", err);
        });
      } else {
        setCachedCutoffs([]);
      }
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Star / Unstar Shortlist
  const toggleShortlist = (item: PredictionRow) => {
    const key = `${item.college_code}|${item.course_name}|${item.category}`;
    const exists = shortlist.some(s => `${s.college_code}|${s.course_name}|${s.category}` === key);
    
    let updated;
    if (exists) {
      updated = shortlist.filter(s => `${s.college_code}|${s.course_name}|${s.category}` !== key);
    } else {
      updated = [...shortlist, { ...item, order: shortlist.length + 1 }];
    }
    
    setShortlist(updated);
    localStorage.setItem('kcet_shortlist', JSON.stringify(updated));
  };

  const isShortlisted = (item: PredictionRow) => {
    const key = `${item.college_code}|${item.course_name}|${item.category}`;
    return shortlist.some(s => `${s.college_code}|${s.course_name}|${s.category}` === key);
  };

  // Reorder Shortlist
  const moveShortlistItem = (index: number, direction: 'up' | 'down') => {
    const updated = [...shortlist];
    if (direction === 'up' && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === 'down' && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    setShortlist(updated);
    localStorage.setItem('kcet_shortlist', JSON.stringify(updated));
  };

  // Fetch Cutoff Trends for Card Expansion
  const handleCardExpand = async (item: PredictionRow) => {
    const key = `${item.college_code}|${item.course_name}|${item.category}`;
    
    if (expandedCard === key) {
      setExpandedCard(null);
      return;
    }
    
    setExpandedCard(key);
    
    if (!trends[key]) {
      setTrendsLoading(prev => ({ ...prev, [key]: true }));
      try {
        const response = await axios.get('/api/kcet/cutoffs', {
          params: {
            college_code: item.college_code,
            course_name: item.course_name,
            category: item.category
          }
        });
        
        const structured: TrendHistory = {
          '2023': { '1': null, '2': null, '3': null },
          '2024': { '1': null, '2': null, '3': null },
          '2025': { '1': null, '2': null, '3': null }
        };
        
        response.data.forEach((row: PredictionRow) => {
          if (structured[row.year]) {
            structured[row.year][row.round] = parseInt(row.cutoff_rank, 10);
          }
        });
        
        setTrends(prev => ({ ...prev, [key]: structured }));
      } catch (err) {
        console.error("Error fetching trend data:", err);
      } finally {
        setTrendsLoading(prev => ({ ...prev, [key]: false }));
      }
    }
  };

  // Filter & Sort Results
  const getProcessedResults = () => {
    const listToProcess = showShortlistOnly ? shortlist : results;
    
    let filtered = listToProcess.filter(item => {
      // College type filter
      if (collegeTypeFilter !== 'All') {
        const type = getCollegeType(item.college_name);
        if (type !== collegeTypeFilter) return false;
      }
      
      // District filter
      if (districtFilter !== 'All') {
        const city = getCollegeCity(item.college_name).toUpperCase();
        if (!city.includes(districtFilter.toUpperCase())) return false;
      }
      
      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      const rankA = parseInt(a.cutoff_rank_num || a.cutoff_rank, 10);
      const rankB = parseInt(b.cutoff_rank_num || b.cutoff_rank, 10);
      
      if (sortBy === 'cutoff_asc') {
        return rankA - rankB;
      } else if (sortBy === 'cutoff_desc') {
        return rankB - rankA;
      } else if (sortBy === 'name_asc') {
        return a.college_name.localeCompare(b.college_name);
      } else if (sortBy === 'chances_asc') {
        const chanceOrder = { 'Safe': 1, 'Moderate': 2, 'Tough': 3 };
        return (chanceOrder[a.chances || 'Tough'] || 99) - (chanceOrder[b.chances || 'Tough'] || 99);
      }
      return 0;
    });

    return filtered;
  };

  // Extract list of cities dynamically
  const getAvailableDistricts = () => {
    const cities = new Set<string>();
    const source = showShortlistOnly ? shortlist : results;
    source.forEach(item => {
      const city = getCollegeCity(item.college_name);
      if (city && city.length > 2) {
        cities.add(city.charAt(0).toUpperCase() + city.slice(1).toLowerCase());
      }
    });
    return Array.from(cities).sort();
  };

  // Export Shortlist/Results as PDF with dynamic client side imports
  const downloadReportPDF = async (type: 'results' | 'shortlist' = 'results') => {
    setPdfLoading(true);
    try {
      const itemsToPrint = type === 'shortlist' ? shortlist : getProcessedResults();
      
      if (itemsToPrint.length === 0) {
        alert('No data available to print in PDF.');
        setPdfLoading(false);
        return;
      }

      // Dynamic imports to prevent Next.js SSR build errors
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      // 1. Get unique college codes
      const uniqueCodes = Array.from(new Set(itemsToPrint.map(r => r.college_code)));
      const categoriesQuery = selectedCategories.join(',');
      
      // 2. Retrieve from background cache or fetch dynamically
      let cutoffRows: PredictionRow[] = [];
      if (type === 'results' && cachedCutoffs.length > 0) {
        cutoffRows = cachedCutoffs;
      } else {
        const response = await axios.get('/api/kcet/cutoffs', {
          params: {
            college_code: uniqueCodes.join(','),
            category: categoriesQuery,
            course_category: activeCategory
          }
        });
        cutoffRows = response.data;
      }
      
      // 3. Group cutoff data
      const grouped: { [key: string]: any } = {};
      cutoffRows.forEach(r => {
        const key = `${r.college_code}|${r.course_name}|${r.category}`;
        if (!grouped[key]) {
          grouped[key] = {
            college_name: r.college_name,
            course_name: r.course_name,
            category: r.category,
            '2023_1': '-', '2023_2': '-', '2023_3': '-',
            '2024_1': '-', '2024_2': '-', '2024_3': '-',
            '2025_1': '-', '2025_2': '-', '2025_3': '-',
          };
        }
        if (r.year && r.round) {
          grouped[key][`${r.year}_${r.round}`] = r.cutoff_rank;
        }
      });

      // 4. Create landscape PDF
      const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(type === 'shortlist' ? 'KCET Custom Choice Option Entry List' : 'KCET Match Prediction Report', 14, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      
      const currentRank = rank || 'N/A';
      doc.text(`User Rank: ${currentRank} | Selected Categories: ${categoriesQuery} | Stream: ${activeCategory} | Date: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text('Cutoff History Report showing Rounds 1, 2, and 3 for 2023, 2024, and 2025 side-by-side', 14, 34);

      const getMinRank = (g: any) => {
        const values = [
          g['2023_1'], g['2023_2'], g['2023_3'],
          g['2024_1'], g['2024_2'], g['2024_3'],
          g['2025_1'], g['2025_2'], g['2025_3']
        ]
          .filter(v => v !== '-' && v !== null && v !== undefined)
          .map(v => parseInt(v, 10))
          .filter(Number.isFinite);
        return values.length ? Math.min(...values) : Number.MAX_SAFE_INTEGER;
      };

      const getChance = (g: any) => {
        const minCutoff = getMinRank(g);
        if (minCutoff === Number.MAX_SAFE_INTEGER) return 'Tough';
        const userRankVal = parseInt(rank, 10);
        if (isNaN(userRankVal)) return 'Tough';
        if (userRankVal <= minCutoff * 0.8) return 'Safe';
        if (userRankVal <= minCutoff) return 'Moderate';
        return 'Tough';
      };

      const getChanceColor = (chance: string) => {
        if (chance === 'Safe') return [187, 247, 208]; // light green
        if (chance === 'Moderate') return [254, 249, 195]; // light yellow
        return [254, 202, 202]; // light red
      };

      const tableColumn = [
        'No.',
        'College Name, Course & Category',
        'Chance',
        '2023 R1', '2023 R2', '2023 R3',
        '2024 R1', '2024 R2', '2024 R3',
        '2025 R1', '2025 R2', '2025 R3'
      ];

      const categoryOrder: { [key: string]: number } = {};
      selectedCategories.forEach((cat, index) => {
        categoryOrder[cat] = index;
      });

      const sortedItems = [...itemsToPrint].map((item, originalIndex) => ({ ...item, originalIndex }))
        .sort((a, b) => {
          const orderA = categoryOrder[a.category] !== undefined ? categoryOrder[a.category] : 999;
          const orderB = categoryOrder[b.category] !== undefined ? categoryOrder[b.category] : 999;
          
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return a.originalIndex - b.originalIndex;
        });

      let currentY = 38;

      selectedCategories.forEach((cat) => {
        const categoryItems = sortedItems.filter(item => item.category === cat);
        if (categoryItems.length === 0) return;

        if (currentY > 165) {
          doc.addPage();
          currentY = 20;
        } else {
          currentY += 8;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(`Category: ${cat} Matches`, 14, currentY);
        currentY += 3;

        const tableRows = categoryItems.map((item, idx) => {
          const key = `${item.college_code}|${item.course_name}|${item.category}`;
          const g = grouped[key] || {
            college_name: item.college_name,
            course_name: item.course_name,
            category: item.category,
            '2023_1': '-', '2023_2': '-', '2023_3': '-',
            '2024_1': '-', '2024_2': '-', '2024_3': '-',
            '2025_1': '-', '2025_2': '-', '2025_3': '-',
          };
          const chance = getChance(g);
          
          return [
            idx + 1,
            `${item.college_code} - ${item.college_name.replace(/,,/g, ', ')}\nCourse: ${item.course_name} | Category: ${item.category}`,
            chance,
            g['2023_1'], g['2023_2'], g['2023_3'],
            g['2024_1'], g['2024_2'], g['2024_3'],
            g['2025_1'], g['2025_2'], g['2025_3']
          ];
        });

        autoTable(doc, {
          startY: currentY,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], halign: 'center' },
          columnStyles: { 
            0: { cellWidth: 10 },
            1: { cellWidth: 110, halign: 'left' }, 
            2: { cellWidth: 20, halign: 'center' } 
          },
          bodyStyles: { halign: 'center', valign: 'middle' },
          didParseCell: (data: any) => {
            if (data.section === 'body' && data.column.index === 2) {
              const chanceVal = data.cell.raw as string;
              data.cell.styles.fillColor = getChanceColor(chanceVal);
              data.cell.styles.textColor = [17, 24, 39];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY;
      });

      const totalPages = doc.internal.getNumberOfPages();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const footerText = `EDU YODHA | Generated on ${new Date().toLocaleString()}`;

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        doc.setPage(pageNumber);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(footerText, 14, pageHeight - 10);
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 34, pageHeight - 10);
      }

      const filename = type === 'shortlist' ? 'KCET_Choice_Option_Entry_Planner.pdf' : `KCET_${activeCategory}_3Year_Cutoffs_Report.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert('Failed to generate PDF. Check logs.');
    } finally {
      setPdfLoading(false);
    }
  };

  const toggleFaq = (idx: number) => {
    setFaqExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleCategorySelection = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleCourseSelection = (course: string) => {
    if (selectedCourses.includes(course)) {
      setSelectedCourses(selectedCourses.filter(c => c !== course));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const getFilteredCourses = () => {
    if (!courseSearchQuery) return courses;
    return courses.filter(c => c.toUpperCase().includes(courseSearchQuery.toUpperCase()));
  };

  const filteredCourses = getFilteredCourses();
  const limitCount = 12;
  const visibleCourses = isShowAllCourses ? filteredCourses : filteredCourses.slice(0, limitCount);

  // SVG Chart component
  const renderTrendChart = (cardKey: string) => {
    const trendData = trends[cardKey];
    if (!trendData) return null;
    
    const yearsList = ['2023', '2024', '2025'];
    const roundsList = ['1', '2', '3'];
    
    const values: number[] = [];
    yearsList.forEach(y => {
      roundsList.forEach(r => {
        const val = trendData[y]?.[r];
        if (val) values.push(val);
      });
    });
    
    if (values.length === 0) {
      return <div className="text-center text-sm text-slate-500 py-4">No historical round cutoffs available for chart.</div>;
    }
    
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1000;
    const yMin = Math.max(1, Math.round(minVal - range * 0.15));
    const yMax = Math.round(maxVal + range * 0.15);
    
    const width = 450;
    const height = 180;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;
    
    const getX = (roundIdx: number) => {
      return paddingLeft + (roundIdx * (width - paddingLeft - paddingRight) / 2);
    };
    
    const getY = (val: number | null) => {
      if (!val) return height - paddingBottom;
      const pct = (val - yMin) / (yMax - yMin);
      return height - paddingBottom - (pct * (height - paddingTop - paddingBottom));
    };

    const colors: { [key: string]: string } = {
      '2023': '#a855f7',
      '2024': '#3b82f6',
      '2025': '#10b981'
    };
    
    return (
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><TrendingUp size={14} /> 3-Year Cutoff Comparison (Round-wise)</h4>
        <div className="bg-slate-100 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
            {[0, 0.5, 1].map((p, i) => {
              const yVal = Math.round(yMax - p * (yMax - yMin));
              const yPos = getY(yVal);
              return (
                <g key={i}>
                  <line x1={paddingLeft} y1={yPos} x2={width - paddingRight} y2={yPos} stroke="rgba(150, 150, 150, 0.15)" strokeDasharray="3,3" />
                  <text x={paddingLeft - 8} y={yPos + 4} textAnchor="end" fill="currentColor" className="text-slate-500 dark:text-slate-400 font-semibold" fontSize="9">{yVal}</text>
                </g>
              );
            })}
            
            {roundsList.map((r, idx) => (
              <text key={r} x={getX(idx)} y={height - 10} textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-400 font-bold" fontSize="10">
                Round {r}
              </text>
            ))}
            
            {yearsList.map(year => {
              const points: any[] = [];
              roundsList.forEach((round, idx) => {
                const val = trendData[year]?.[round];
                if (val) {
                  points.push({ x: getX(idx), y: getY(val), val, round });
                }
              });
              
              if (points.length < 2) return null;
              
              let pathD = `M ${points[0].x} ${points[0].y}`;
              for (let i = 1; i < points.length; i++) {
                pathD += ` L ${points[i].x} ${points[i].y}`;
              }
              
              return (
                <g key={year}>
                  <path d={pathD} fill="none" stroke={colors[year]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {points.map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="5" fill="currentColor" className="text-slate-50 dark:text-slate-950" stroke={colors[year]} strokeWidth="3" />
                      <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="currentColor" className="text-slate-800 dark:text-slate-200 font-bold" fontSize="9">
                        {pt.val}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-center gap-6 flex-wrap">
          {yearsList.map(year => (
            <div key={year} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[year] }}></span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{year} Cutoffs</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const processedResults = getProcessedResults();
  const availableDistricts = getAvailableDistricts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 bg-clip-text text-transparent mb-2">
          KCET Predictor & Option Entry Planner
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm font-semibold">
          Evaluate previous years KEA cutoffs to predict admission probabilities and organize your custom choice-filling sheets.
        </p>
      </header>

      {/* Stats Dashboard banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl shadow-slate-100 dark:shadow-none mb-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
            {categoryIcons[activeCategory] || <BookOpen size={20} />}
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase">Stream</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{activeCategory}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <GraduationCap size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase">Courses</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {selectedCourses.length === 0 ? 'All' : `${selectedCourses.length} Selected`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Award size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase">Categories</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedCategories.join(', ')}</span>
          </div>
        </div>
        <button
          onClick={() => {
            setShowShortlistOnly(!showShortlistOnly);
            setSearched(false);
          }}
          className="flex items-center gap-3 text-left w-full hover:bg-slate-50 dark:hover:bg-slate-800/20 p-2 rounded-2xl transition-all cursor-pointer"
        >
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Star size={20} fill={shortlist.length > 0 ? '#f59e0b' : 'none'} />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase">My Shortlist</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{shortlist.length} Colleges</span>
          </div>
        </button>
      </div>

      {/* Main Options Tabs */}
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={() => {
            setShowShortlistOnly(false);
            setSearched(false);
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
            !showShortlistOnly 
              ? 'bg-blue-600 text-white border-transparent' 
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Predictor Dashboard
        </button>
        <button
          onClick={() => {
            setShowShortlistOnly(true);
            setSearched(false);
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
            showShortlistOnly 
              ? 'bg-blue-600 text-white border-transparent' 
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Option Entry Planner ({shortlist.length})
        </button>
      </div>

      {!showShortlistOnly ? (
        <div className="grid grid-cols-1 gap-6">
          {/* Category tabs */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Stream</span>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setResults([]);
                    setSelectedCourses([]);
                    setSearched(false);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {categoryIcons[cat] || <BookOpen size={14} />}
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Panel */}
          <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl">
            <form onSubmit={handlePredict} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rank Input */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="rank" className="text-xs font-bold uppercase text-slate-400">Enter KCET Rank</label>
                  <input
                    type="number"
                    id="rank"
                    placeholder="Enter rank, e.g. 15000"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    required
                    min="1"
                    className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                  />
                </div>

                {/* Region Quota Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Quota Region</label>
                  <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleRegionChange('RK')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        quotaRegion === 'RK' ? 'bg-blue-600 text-white' : 'text-slate-500'
                      }`}
                    >
                      General Quota (Rest of KA)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRegionChange('HK')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        quotaRegion === 'HK' ? 'bg-blue-600 text-white' : 'text-slate-500'
                      }`}
                    >
                      Kalyana-Karnataka (371j)
                    </button>
                  </div>
                </div>
              </div>

              {/* Category selector */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories (Toggle multiple)</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategories(admissionCategories)}
                      className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategories(quotaRegion === 'RK' ? ['GM'] : ['GMH'])}
                      className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer"
                    >
                      GM Only
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
                  {admissionCategories.map(cat => {
                    const isSel = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategorySelection(cat)}
                        className={`py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                          isSel
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Course Selector */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-400">Select Courses (Optional)</span>
                  {selectedCourses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedCourses([])}
                      className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Clear ({selectedCourses.length})
                    </button>
                  )}
                </div>

                {courses.length > 8 && (
                  <input
                    type="text"
                    placeholder="🔍 Search courses..."
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold mb-2"
                  />
                )}

                {courses.length === 0 ? (
                  <div className="text-xs text-slate-500">No courses loaded for this category.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {visibleCourses.map(course => {
                      const isSel = selectedCourses.includes(course);
                      return (
                        <button
                          key={course}
                          type="button"
                          onClick={() => toggleCourseSelection(course)}
                          className={`flex items-center gap-1.5 p-2 rounded-xl text-left text-xs font-bold cursor-pointer border transition-all ${
                            isSel
                              ? 'bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Check size={12} className={`shrink-0 ${isSel ? 'opacity-100' : 'opacity-0'}`} />
                          <span className="truncate">{course}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {filteredCourses.length > limitCount && (
                  <button
                    type="button"
                    onClick={() => setIsShowAllCourses(!isShowAllCourses)}
                    className="text-xs font-bold text-blue-500 hover:underline text-center mt-2 cursor-pointer"
                  >
                    {isShowAllCourses ? 'Show Less' : `+ Show All ${filteredCourses.length} Courses`}
                  </button>
                )}
              </div>

              {/* Submit Prediction */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-60 transition-all text-sm uppercase tracking-wider"
              >
                {loading ? 'Evaluating Cutoffs...' : <><Search size={16} /> Evaluate Matching Colleges</>}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Shortlist Planner panel */
        <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">📋 Option Entry Shortlist Planner</h3>
              <p className="text-xs text-slate-500 font-semibold">Arrange college choices in priority order. You can export this sheet to assist in option entry.</p>
            </div>
            <button
              onClick={() => downloadReportPDF('shortlist')}
              disabled={shortlist.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer disabled:opacity-60 transition-all"
            >
              <Download size={14} />
              <span>Download Choice Sheet (PDF)</span>
            </button>
          </div>

          {shortlist.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <Star size={40} className="text-slate-300 animate-bounce" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">Your shortlist is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Go back to the search predictor dashboard and star college choices to build your template list.</p>
              <button
                onClick={() => setShowShortlistOnly(false)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Find Matches Now
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {shortlist.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-[10px] font-extrabold rounded text-slate-600 dark:text-slate-300">
                          {item.college_code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {getCollegeType(item.college_name)}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                        {item.college_name.replace(/,,/g, ', ')}
                      </h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <BookOpen size={10} />
                        <span>{item.course_name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 shrink-0">
                    <div className="text-right">
                      <span className="block text-xs font-extrabold text-blue-600">{item.cutoff_rank}</span>
                      <span className="text-[10px] text-slate-500">({item.category} Category | Year {item.year})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveShortlistItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-350 cursor-pointer disabled:opacity-40"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => moveShortlistItem(idx, 'down')}
                          disabled={idx === shortlist.length - 1}
                          className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-350 cursor-pointer disabled:opacity-40"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => toggleShortlist(item)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                        title="Remove from shortlist"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prediction results grid */}
      {searched && !showShortlistOnly && (
        <div className="mt-10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
              Prediction Results ({processedResults.length} matches)
            </h2>
            {processedResults.length > 0 && (
              <button
                onClick={() => downloadReportPDF('results')}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-60 transition-all"
              >
                <Download size={14} />
                <span>{pdfLoading ? 'Building PDF...' : `Download ${activeCategory} PDF`}</span>
              </button>
            )}
          </div>

          {/* Controls Bar for filters & Sort */}
          <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow">
            <div 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="flex justify-between items-center cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} />
                <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Filter & Sort Options</h3>
              </div>
              {isFilterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {isFilterExpanded && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Seat Type</label>
                  <select
                    value={collegeTypeFilter}
                    onChange={(e) => setCollegeTypeFilter(e.target.value)}
                    className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  >
                    <option value="All">All Seats</option>
                    <option value="Government">Government / Uni Seat</option>
                    <option value="Aided">Aided Seat</option>
                    <option value="Private">Private Seat</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400">District / City</label>
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  >
                    <option value="All">All Districts</option>
                    {availableDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  >
                    <option value="cutoff_asc">Cutoff: Low to High (Competitive)</option>
                    <option value="cutoff_desc">Cutoff: High to Low</option>
                    <option value="name_asc">College Name: A to Z</option>
                    <option value="chances_asc">Admission Chance: Safe First</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <span className="text-sm font-bold text-slate-500 animate-pulse">Running predictor modules...</span>
            </div>
          ) : processedResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedResults.map((result, idx) => {
                const cardKey = `${result.college_code}|${result.course_name}|${result.category}`;
                const isCardExpanded = expandedCard === cardKey;
                const isStarred = isShortlisted(result);
                
                let oddsPct = '15%';
                let oddsDesc = 'High competition, keep as backup';
                if (result.chances === 'Safe') {
                  oddsPct = '90%';
                  oddsDesc = 'Excellent chance of allotment';
                } else if (result.chances === 'Moderate') {
                  oddsPct = '55%';
                  oddsDesc = 'Good chance, list in choice sheet';
                }

                return (
                  <div 
                    key={idx} 
                    className={`relative bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow transition-all hover:-translate-y-1 hover:shadow-lg ${
                      isCardExpanded ? 'md:col-span-2' : ''
                    }`}
                  >
                    {/* Color bar indicator */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl ${
                      result.chances === 'Safe' ? 'bg-emerald-500' : result.chances === 'Moderate' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />

                    <div className="flex justify-between items-center mb-3 pl-1">
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold rounded">
                        {result.college_code}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleShortlist(result)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
                          title="Add to choice list"
                        >
                          <Star size={16} fill={isStarred ? '#f59e0b' : 'none'} color={isStarred ? '#f59e0b' : 'currentColor'} />
                        </button>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          result.chances === 'Safe' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                            : result.chances === 'Moderate' 
                              ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' 
                              : 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                        }`}>
                          {result.chances}
                        </span>
                      </div>
                    </div>

                    <div onClick={() => handleCardExpand(result)} className="cursor-pointer pl-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        {getCollegeType(result.college_name)} College | {getCollegeCity(result.college_name)}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-2 leading-snug line-clamp-2">
                        {result.college_name.replace(/,,/g, ', ')}
                      </h3>
                      
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-4">
                        <BookOpen size={12} className="shrink-0" />
                        <span className="truncate">{result.course_name}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-3 mb-4 text-left">
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase">Cutoff ({result.category})</span>
                          <span className="text-lg font-black text-slate-700 dark:text-slate-200">{result.cutoff_rank}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase">KEA Year/Round</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.year} / R{result.round}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-2.5 border border-slate-200/40 dark:border-slate-800/40 text-left">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                          <span>Admit Chance</span>
                          <span className="font-extrabold">{oddsPct}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              result.chances === 'Safe' ? 'bg-emerald-500' : result.chances === 'Moderate' ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: oddsPct }}
                          />
                        </div>
                        <span className="block text-[9px] text-slate-400 font-semibold mt-1">{oddsDesc}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-blue-500 mt-3 pt-2.5 border-t border-dashed border-slate-250 dark:border-slate-800">
                        <span>{isCardExpanded ? 'Close Trend Analysis' : 'View 3-Year Cutoff Graph'}</span>
                        {isCardExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </div>
                    </div>

                    {isCardExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-left">
                        {trendsLoading[cardKey] ? (
                          <div className="text-center text-xs text-slate-500 py-4 animate-pulse">Loading trend statistics...</div>
                        ) : (
                          renderTrendChart(cardKey)
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center gap-3">
              <Compass size={40} className="text-slate-350" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">No matching colleges found</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">No cutoff records match this combination. Try modifying your category selectors or rank filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Guide Accordion Section */}
      <section className="bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-md mt-12">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
          <HelpCircle size={18} /> KCET Option Entry Choice Rules
        </h3>
        <p className="text-xs text-slate-500 font-semibold mb-6">Understanding choices in KEA counselling is critical. Review the guide below:</p>
        
        <div className="flex flex-col gap-3">
          {[
            {
              q: "What is KEA Option Entry?",
              a: "During option entry, you enter your preferred combinations of college and course in a prioritized list (e.g. priority #1 is your most desired seat, priority #2 is next, and so on). KEA processes the list from top to bottom, checking if your rank qualifies for a seat. You will be allotted the highest option on your list for which you meet the cutoff."
            },
            {
              q: "What is Choice 1, Choice 2, Choice 3, and Choice 4 in KEA?",
              a: "After a seat is allotted in Round 1/2, you must select one of four choices:\n\n• Choice 1: Satisfied with seat. Accept, pay fee, download admission order, and join the college. You are out of further rounds.\n• Choice 2: Satisfied but want to participate in the next round for HIGHER priority options. Hold the current seat; if a higher option is allotted in the next round, the current seat is lost. If no higher option is allotted, you keep this seat.\n• Choice 3: Not satisfied. Reject the allotted seat, but participate in the next round. The current seat is freed up for other candidates.\n• Choice 4: Not satisfied. Reject the seat and exit KEA counselling entirely."
            },
            {
              q: "How does the EDU YODHA shortlist planner help me?",
              a: "You can shortlist potential matches by clicking the star icon in the predictor. Go to 'My Option Entry', arrange them in order of priority using the Up/Down buttons, and download it as a PDF. Use this PDF as a copy sheet template when filling choices in the KEA portal."
            },
            {
              q: "What are Kalyana-Karnataka (HK) categories?",
              a: "Kalyana-Karnataka region candidates have 8% reserve seats in State-level institutions and 70-80% reservations in local institutions across Bidar, Kalaburagi, Yadgir, Raichur, Koppal, Vijayanagar, and Ballari districts. Select 'Kalyana-Karnataka (371j)' to search with HK-specific category codes ending with 'H' (e.g. GMH, 2AH)."
            }
          ].map((item, idx) => (
            <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div 
                onClick={() => toggleFaq(idx)}
                className="flex justify-between items-center p-4 bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer select-none"
              >
                <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-200">{item.q}</h4>
                {faqExpanded[idx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              {faqExpanded[idx] && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-450 leading-relaxed whitespace-pre-line">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
