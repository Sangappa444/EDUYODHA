document.addEventListener('DOMContentLoaded', () => {
    const categoryContainer = document.getElementById('category-container');
    const videoGrid = document.getElementById('video-grid');
    const loader = document.getElementById('loader');
    const searchInput = document.getElementById('search-input');
    const filterDropdown = document.getElementById('filter-dropdown');
    
    // Progress & Cert
    const progressSection = document.getElementById('progress-section');
    const progressText = document.getElementById('progress-text');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const claimCertBtn = document.getElementById('claim-cert-btn');
    const certModal = document.getElementById('cert-modal');
    const closeModal = document.getElementById('close-modal');
    const namePromptSection = document.getElementById('name-prompt-section');
    const certDisplaySection = document.getElementById('certificate-display');
    const generateCertBtn = document.getElementById('generate-cert-btn');
    const studentNameInput = document.getElementById('student-name-input');
    const printCertBtn = document.getElementById('print-cert-btn');
    const certStudentName = document.getElementById('cert-student-name');
    const certPlaylistName = document.getElementById('cert-playlist-name');

    // Premium Features
    const goproBtn = document.getElementById('gopro-nav-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModal = document.getElementById('close-payment-modal');
    const submitPaymentBtn = document.getElementById('submit-payment-btn');
    const mockCc = document.getElementById('mock-cc');

    let allCategories = ['All'];
    window.currentCategory = 'All';

    async function loadCategories() {
        try {
            const res = await fetch('/api/categories');
            const categories = await res.json();
            
            categories.forEach(cat => {
                if (cat && !allCategories.includes(cat)) {
                    allCategories.push(cat);
                }
            });

            if(localStorage.getItem('eduYodhaPro')) {
                goproBtn.innerHTML = '<i data-lucide="check-circle"></i> PRO ACTIVE';
                goproBtn.style.pointerEvents = 'none';
            }

            renderCategories();
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    function renderCategories() {
        categoryContainer.innerHTML = '';
        allCategories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `category-btn ${cat === 'All' ? 'active' : ''}`;
            btn.dataset.category = cat;
            
            btn.textContent = cat === 'All' ? 'All Videos' : cat.replace(/_/g, ' ');

            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                window.currentCategory = cat;
                loadVideos(cat);
            });

            categoryContainer.appendChild(btn);
        });
        if(window.lucide) window.lucide.createIcons();
    }

    async function loadVideos(category = 'All') {
        videoGrid.innerHTML = '';
        videoGrid.appendChild(loader);
        loader.style.display = 'flex';

        try {
            let url = '/api/videos';
            if (category !== 'All') url += `?category=${encodeURIComponent(category)}`;
            const res = await fetch(url);
            const data = await res.json();
            window.currentVideos = Array.isArray(data) ? data : [];
            
            loader.style.display = 'none';
            applyFilters();
            
        } catch (error) {
            loader.style.display = 'none';
            console.error("Error fetching videos:", error);
        }
    }

    const searchRecommendations = document.getElementById('search-recommendations');

    function applyFilters() {
        if (!window.currentVideos) return;
        
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const filterState = filterDropdown ? filterDropdown.value : 'All';
        const watchedData = JSON.parse(localStorage.getItem('eduYodhaWatched')) || {};

        const filtered = window.currentVideos.filter(v => {
            const matchesSearch = v.title.toLowerCase().includes(query) || v.category.toLowerCase().includes(query);
            let matchesState = true;
            if (filterState === 'Watched') matchesState = !!watchedData[v.id];
            else if (filterState === 'Unwatched') matchesState = !watchedData[v.id];

            return matchesSearch && matchesState;
        });

        renderVideos(filtered);
        updateProgress();

        // Sub-feature: Recommendations Dropdown
        if (query.length > 0) {
            searchRecommendations.style.display = 'flex';
            searchRecommendations.innerHTML = '';
            // Only show up to 5 recommendations to keep it fast and clean
            const recs = filtered.slice(0, 5);
            if (recs.length === 0) {
                searchRecommendations.innerHTML = '<div class="recommendation-item" style="color:var(--text-secondary); cursor:default;">No matches found</div>';
            } else {
                recs.forEach(v => {
                    const item = document.createElement('div');
                    item.className = 'recommendation-item';
                    item.innerHTML = `<i data-lucide="play-circle"></i> <span>${v.title}</span>`;
                    item.addEventListener('click', () => {
                        searchInput.value = v.title;
                        searchRecommendations.style.display = 'none';
                        applyFilters();
                    });
                    searchRecommendations.appendChild(item);
                });
                if(window.lucide) window.lucide.createIcons();
            }
        } else {
            searchRecommendations.style.display = 'none';
        }
    }

    // Hide recommendations when clicking outside
    document.addEventListener('click', (e) => {
        if (searchRecommendations && !e.target.closest('.search-box')) {
            searchRecommendations.style.display = 'none';
        }
    });

    function renderVideos(videos) {
        videoGrid.innerHTML = '';
        if (videos.length === 0) {
            videoGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No videos found.</p>';
            return;
        }

        const likedVideos = JSON.parse(localStorage.getItem('eduYodhaLikes')) || {};
        const watchedVideos = JSON.parse(localStorage.getItem('eduYodhaWatched')) || {};

        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            
            const isLiked = likedVideos[video.id] ? 'liked' : '';
            const isWatched = watchedVideos[video.id] ? 'watched' : '';

            const isProUser = !!localStorage.getItem('eduYodhaPro');
            const showLock = video.is_premium && !isProUser;

            let videoWrapperContent = '';
            if (showLock) {
                videoWrapperContent = `
                    <div class="locked-video" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; background:var(--background); color:var(--text); border-radius:10px; text-align:center;">
                        <i data-lucide="lock" style="width: 40px; height: 40px; margin-bottom: 10px; color:#ff4757;"></i>
                        <h4 style="margin-bottom:10px; color:#ff4757;">Premium Video</h4>
                        <button class="cta-btn" onclick="document.getElementById('payment-modal').style.display='flex'; document.body.style.overflow='hidden';">Unlock with PRO</button>
                    </div>
                `;
            } else {
                videoWrapperContent = `<iframe src="https://www.youtube.com/embed/${video.youtube_id}" title="${video.title}" allowfullscreen></iframe>`;
            }

            card.innerHTML = `
                <div class="video-wrapper">
                    ${videoWrapperContent}
                </div>
                <div class="video-info">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                         <span class="video-category">${video.category.replace(/_/g, ' ')} ${video.is_premium ? '<span style="color:#ff4757; font-size:0.75rem; margin-left:0.5rem;"><i data-lucide="gem" style="width:12px; height:12px; display:inline-block; vertical-align:middle;"></i> PRO</span>' : ''}</span>
                         <div style="display: flex; gap: 0.5rem;">
                             <button class="watch-btn ${isWatched}" data-vid="${video.id}">
                                  <i data-lucide="check-circle" class="check-icon"></i> <span class="watch-text">${isWatched ? 'Completed' : 'Mark Watched'}</span>
                             </button>
                             <button class="like-btn ${isLiked}" data-vid="${video.id}" title="Like">
                                  <i data-lucide="heart" class="heart-icon"></i>
                             </button>
                         </div>
                    </div>
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-desc">${video.description}</p>
                    
                    <!-- Feature Action Bar -->
                    <div class="video-actions">
                        <button class="action-toggle-btn" onclick="toggleComments(${video.id})">
                            <i data-lucide="message-square"></i> Comments
                        </button>
                        <button class="action-toggle-btn" onclick="toggleNotebook(${video.id})">
                            <i data-lucide="pen-tool"></i> Take Notes
                        </button>
                        <button class="action-toggle-btn share-btn-action" onclick="shareVideo(${video.id}, '${video.title.replace(/'/g, "\\'")}')">
                            <i data-lucide="send"></i> Share
                        </button>
                    </div>
                    
                    <!-- Comments Panel -->
                    <div id="comments-section-${video.id}" class="comments-panel" style="display: none;">
                        <div class="comments-list" id="comments-list-${video.id}">
                            <p style="text-align:center; font-size: 0.8rem; color:#888;">Loading...</p>
                        </div>
                        <div class="comment-input-area">
                            <input type="text" id="comment-input-${video.id}" placeholder="Ask a question or comment...">
                            <button onclick="postComment(${video.id})">Post</button>
                        </div>
                    </div>

                    <!-- Notebook Panel -->
                    <div id="notebook-section-${video.id}" class="notebook-panel" style="display: none;">
                        <textarea id="notebook-input-${video.id}" class="notebook-textarea" placeholder="Type your personal study notes here... They will auto-save!"></textarea>
                        <div class="notebook-toolbar">
                            <span id="notebook-status-${video.id}">Saved securely in browser.</span>
                            <button class="btn-download-notes" onclick="downloadNotes(${video.id}, '${video.title.replace(/'/g, "\\'")}')">
                                <i data-lucide="download"></i> Download .txt
                            </button>
                        </div>
                    </div>
                </div>
            `;
            videoGrid.appendChild(card);
        });

        if(window.lucide) window.lucide.createIcons();
        attachInteractions();
    }

    // Global toggle comments function
    window.toggleComments = async function(vid) {
        const panel = document.getElementById(`comments-section-${vid}`);
        const list = document.getElementById(`comments-list-${vid}`);
        if(panel.style.display === 'none') {
            panel.style.display = 'block';
            try {
                const res = await fetch(`/api/comments/${vid}`);
                const data = await res.json();
                list.innerHTML = '';
                if(data.length === 0) list.innerHTML = '<p style="font-size:0.8rem; color:#bbb;">No comments yet. Be the first!</p>';
                data.forEach(c => {
                    list.innerHTML += `<div class="comment-item"><strong>${c.student_name}</strong>: ${c.comment_text}</div>`;
                });
            } catch(e) {
                list.innerHTML = '<p style="color:red; font-size:0.8rem;">Failed to load comments</p>';
            }
        } else {
            panel.style.display = 'none';
        }
    };

    window.postComment = async function(vid) {
        const input = document.getElementById(`comment-input-${vid}`);
        const text = input.value.trim();
        if(!text) return;
        const studentName = localStorage.getItem('eduYodhaStudentName') || 'Anonymous Student';
        
        try {
            await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_id: vid, student_name: studentName, comment_text: text })
            });
            input.value = '';
            // Refresh comments manually by simulating toggle
            document.getElementById(`comments-section-${vid}`).style.display = 'none';
            window.toggleComments(vid);
        } catch(e) {
            console.error("Failed to post");
        }
    };

    // Global Notebook logic
    window.toggleNotebook = function(vid) {
        const panel = document.getElementById(`notebook-section-${vid}`);
        const textarea = document.getElementById(`notebook-input-${vid}`);
        
        if(panel.style.display === 'none') {
            panel.style.display = 'block';
            
            // Load existing notes from localStorage
            const savedNotes = JSON.parse(localStorage.getItem('eduYodhaNotes')) || {};
            if(savedNotes[vid]) {
                textarea.value = savedNotes[vid];
            }
            
            // Attach auto-save listener
            textarea.oninput = function() {
                const notes = JSON.parse(localStorage.getItem('eduYodhaNotes')) || {};
                notes[vid] = textarea.value;
                localStorage.setItem('eduYodhaNotes', JSON.stringify(notes));
                document.getElementById(`notebook-status-${vid}`).innerText = 'Autosaving...';
                
                clearTimeout(window[`saveTimer${vid}`]);
                window[`saveTimer${vid}`] = setTimeout(() => {
                    document.getElementById(`notebook-status-${vid}`).innerText = 'Saved securely in browser.';
                }, 1000);
            };
        } else {
            panel.style.display = 'none';
        }
    };

    window.downloadNotes = function(vid, title) {
        const notes = JSON.parse(localStorage.getItem('eduYodhaNotes')) || {};
        const text = notes[vid] || "";
        if(!text.trim()) return alert('Your notebook is empty. Type some notes first!');
        
        const blob = new Blob([text], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `EDU_YODHA_Notes_${title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    window.shareVideo = function(vid, title) {
        // Mock share logic integrating WhatsApp Web
        const shareText = encodeURIComponent(`Hey! I'm studying using this awesome video on EDU YODHA: "${title}"\n\nCheck it out here: http://localhost:3000`);
        window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
    };

    function attachInteractions() {
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                 const vid = btn.dataset.vid;
                 const likes = JSON.parse(localStorage.getItem('eduYodhaLikes')) || {};
                 if (likes[vid]) {
                     delete likes[vid];
                     btn.classList.remove('liked');
                 } else {
                     likes[vid] = true;
                     btn.classList.add('liked');
                 }
                 localStorage.setItem('eduYodhaLikes', JSON.stringify(likes));
            });
        });

        document.querySelectorAll('.watch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                 const vid = btn.dataset.vid;
                 const watched = JSON.parse(localStorage.getItem('eduYodhaWatched')) || {};
                 
                 if (watched[vid]) {
                     delete watched[vid];
                     btn.classList.remove('watched');
                     btn.querySelector('.watch-text').innerText = 'Mark Watched';
                 } else {
                     watched[vid] = true;
                     btn.classList.add('watched');
                     btn.querySelector('.watch-text').innerText = 'Completed';
                 }
                 localStorage.setItem('eduYodhaWatched', JSON.stringify(watched));
                 updateProgress(); 
            });
        });
    }

    function updateProgress() {
        if (window.currentCategory === 'All') {
            progressSection.style.display = 'none';
            return;
        }

        const totalCategoryVideos = window.currentVideos.length;
        if (totalCategoryVideos === 0) return;

        const watchedData = JSON.parse(localStorage.getItem('eduYodhaWatched')) || {};
        let watchedCount = 0;
        
        window.currentVideos.forEach(v => {
             if (watchedData[v.id]) watchedCount++;
        });

        const percent = Math.round((watchedCount / totalCategoryVideos) * 100);
        
        progressSection.style.display = 'block';
        progressBarFill.style.width = `${percent}%`;
        progressText.innerText = `Playlist Progress: ${percent}% Completed (${watchedCount}/${totalCategoryVideos})`;

        if (percent === 100) {
            claimCertBtn.style.display = 'flex';
            
            const isGenerated = localStorage.getItem(`eduYodhaCert_${window.currentCategory}`);
            if (isGenerated) {
                claimCertBtn.innerHTML = '<i data-lucide="award"></i> View Certificate';
            } else {
                claimCertBtn.innerHTML = '<i data-lucide="award"></i> Claim Certificate';
            }
            if(window.lucide) window.lucide.createIcons();

            if(window.confetti && !window.celebrated && !isGenerated) {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                window.celebrated = true;
            }
        } else {
            claimCertBtn.style.display = 'none';
            window.celebrated = false;
        }
    }

    // Modal & Certificate Logic
    if(claimCertBtn) {
        claimCertBtn.addEventListener('click', () => {
            certModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            const savedName = localStorage.getItem('eduYodhaStudentName');
            const isGenerated = localStorage.getItem(`eduYodhaCert_${window.currentCategory}`);
            
            if (isGenerated && savedName) {
                namePromptSection.style.display = 'none';
                certStudentName.innerText = savedName;
                certPlaylistName.innerText = window.currentCategory.replace(/_/g, ' ');
                certDisplaySection.style.display = 'block';
            } else {
                namePromptSection.style.display = 'block';
                certDisplaySection.style.display = 'none';
                if (savedName) studentNameInput.value = savedName;
            }
        });
    }

    if(closeModal) closeModal.addEventListener('click', () => { certModal.style.display = 'none'; document.body.style.overflow = 'auto';});
    
    if(generateCertBtn) {
        generateCertBtn.addEventListener('click', () => {
            const name = studentNameInput.value.trim();
            if (!name) return alert('Please enter your name to generate the certificate.');
            localStorage.setItem('eduYodhaStudentName', name);
            localStorage.setItem(`eduYodhaCert_${window.currentCategory}`, 'true');
            if (claimCertBtn) {
                claimCertBtn.innerHTML = '<i data-lucide="award"></i> View Certificate';
                if(window.lucide) window.lucide.createIcons();
            }
            namePromptSection.style.display = 'none';
            certStudentName.innerText = name;
            certPlaylistName.innerText = window.currentCategory.replace(/_/g, ' ');
            certDisplaySection.style.display = 'block';
            if(window.confetti) confetti({ particleCount: 200, spread: 120, origin: { y: 0.3 } });
        });
    }
    
    if(printCertBtn) printCertBtn.addEventListener('click', () => window.print());

    // GoPro Payment Modal Logic
    if(goproBtn) {
        goproBtn.addEventListener('click', () => {
            paymentModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    if(closePaymentModal) {
        closePaymentModal.addEventListener('click', () => {
            paymentModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if(submitPaymentBtn) {
        submitPaymentBtn.addEventListener('click', () => {
            const cc = mockCc.value.trim();
            if(!cc) return alert('Enter a mock card number to simulate payment.');
            // Mock Success
            submitPaymentBtn.innerText = "Processing...";
            submitPaymentBtn.style.opacity = "0.7";
            setTimeout(() => {
                localStorage.setItem('eduYodhaPro', 'true');
                paymentModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                alert("Payment Successful! You are now an EDU YODHA PRO member. Premium videos unlocked!");
                location.reload();
            }, 1500);
        });
    }

    // AI Mock Test Logic
    const aiTestModal = document.getElementById('ai-test-modal');
    const closeAiTestModal = document.getElementById('close-ai-test-modal');
    const testSubjectTitle = document.getElementById('test-subject-title');
    const chapterInput = document.getElementById('chapter-input');
    const mockNameInput = document.getElementById('mock-name-input');
    const generateTestBtn = document.getElementById('generate-test-btn');
    
    const testSetupPhase = document.getElementById('test-setup-phase');
    const testLoadingPhase = document.getElementById('test-loading-phase');
    const testActivePhase = document.getElementById('test-active-phase');
    const testResultsPhase = document.getElementById('test-results-phase');

    const questionTracker = document.getElementById('question-tracker');
    const testTimer = document.getElementById('test-timer');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    
    const testScoreDisplay = document.getElementById('test-score-display');
    const testExplanations = document.getElementById('test-explanations');

    let currentTestSubject = '';
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let currentScore = 0;
    let selectedOption = null;
    let timerInterval = null;

    document.querySelectorAll('.mock-subject-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentTestSubject = e.target.dataset.subject;
            testSubjectTitle.innerText = `KCET ${currentTestSubject} Test`;
            chapterInput.value = '';
            const savedName = localStorage.getItem('eduYodhaStudentName');
            if (savedName && mockNameInput) mockNameInput.value = savedName;
            
            testSetupPhase.style.display = 'block';
            testLoadingPhase.style.display = 'none';
            testActivePhase.style.display = 'none';
            testResultsPhase.style.display = 'none';
            
            aiTestModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    if(closeAiTestModal) {
        closeAiTestModal.addEventListener('click', () => {
            aiTestModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            clearInterval(timerInterval);
        });
    }

    generateTestBtn.addEventListener('click', async () => {
        const chapter = chapterInput.value.trim() || "Mixed Important Topics";
        const mockName = mockNameInput.value.trim();
        
        if (!mockName) return alert("Please enter your name for the certificate before starting.");
        localStorage.setItem('eduYodhaStudentName', mockName);
        
        testSetupPhase.style.display = 'none';
        testLoadingPhase.style.display = 'block';

        try {
            const response = await fetch('/api/mocktest/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: currentTestSubject, chapter })
            });

            if (!response.ok) throw new Error("API Error");
            
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error("Invalid format");

            currentQuestions = data;
            currentQuestionIndex = 0;
            currentScore = 0;
            testFinished = false;
            
            testLoadingPhase.style.display = 'none';
            testActivePhase.style.display = 'block';
            
            startTimer(currentQuestions.length * 60); // 1 minute per question
            renderQuestion();

        } catch (error) {
            console.error(error);
            alert("Failed to generate questions. Please check your API key or try again.");
            testLoadingPhase.style.display = 'none';
            testSetupPhase.style.display = 'block';
        }
    });

    function startTimer(duration) {
        clearInterval(timerInterval);
        let timer = duration;
        testTimer.innerText = formatTime(timer);
        
        timerInterval = setInterval(() => {
            timer--;
            testTimer.innerText = formatTime(timer);
            if (timer <= 0) {
                clearInterval(timerInterval);
                finishTest();
            }
        }, 1000);
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function renderQuestion() {
        const q = currentQuestions[currentQuestionIndex];
        questionTracker.innerText = `Question ${currentQuestionIndex + 1}/${currentQuestions.length}`;
        questionText.innerText = q.question;
        
        optionsContainer.innerHTML = '';
        selectedOption = null;
        nextQuestionBtn.disabled = true;

        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.style.cssText = 'padding: 10px 15px; text-align: left; background: #ffffff; color: #000000; border: 2px solid #ccc; border-radius: 8px; cursor: pointer; transition: 0.2s;';
            btn.innerText = opt;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.option-btn').forEach(b => {
                    b.style.borderColor = '#ccc';
                    b.style.background = '#ffffff';
                });
                btn.style.borderColor = 'var(--primary)';
                btn.style.background = 'rgba(107, 70, 193, 0.1)';
                selectedOption = opt;
                nextQuestionBtn.disabled = false;
            });
            
            optionsContainer.appendChild(btn);
        });
    }

    nextQuestionBtn.addEventListener('click', () => {
        if (!selectedOption) return;
        
        const q = currentQuestions[currentQuestionIndex];
        // Track whether user was correct
        q.userCorrect = (selectedOption === q.answer);
        if (q.userCorrect) currentScore++;

        currentQuestionIndex++;
        
        if (currentQuestionIndex < currentQuestions.length) {
            renderQuestion();
        } else {
            finishTest();
        }
    });

    let testFinished = false;

    function finishTest() {
        if (testFinished) return;
        testFinished = true;
        
        clearInterval(timerInterval);
        testActivePhase.style.display = 'none';
        testResultsPhase.style.display = 'block';
        
        testScoreDisplay.innerText = `${currentScore} / ${currentQuestions.length}`;
        
        testExplanations.innerHTML = '';
        currentQuestions.forEach((q, i) => {
            const item = document.createElement('div');
            item.style.marginBottom = '1rem';
            item.style.padding = '1rem';
            item.style.background = q.userCorrect ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)';
            item.style.borderLeft = `4px solid ${q.userCorrect ? '#2ed573' : '#ff4757'}`;
            item.innerHTML = `
                <p><strong>Q${i+1}: ${q.question}</strong></p>
                <p style="color: ${q.userCorrect ? '#2ed573' : '#ff4757'}; font-weight:bold;">Your Answer: ${q.userCorrect ? 'Correct' : 'Incorrect (Correct: ' + q.answer + ')'}</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;"><em>Explanation:</em> ${q.explanation}</p>
            `;
            testExplanations.appendChild(item);
        });
        
        if(window.confetti && currentScore >= currentQuestions.length / 2) {
            confetti({ particleCount: 200, spread: 120, origin: { y: 0.3 } });
        }
        
        // Auto-generate certificate
        const finalName = localStorage.getItem('eduYodhaStudentName') || 'Student';
        setTimeout(() => {
            if(certModal) {
                certModal.style.display = 'flex';
                namePromptSection.style.display = 'none';
                certStudentName.innerText = finalName;
                certPlaylistName.innerText = `KCET ${currentTestSubject} Mock Test`;
                certDisplaySection.style.display = 'block';
                if(window.confetti) confetti({ particleCount: 200, spread: 120, origin: { y: 0.3 } });
            }
        }, 1500);
    }

    // Auth Logic
    const authNavBtn = document.getElementById('auth-nav-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = document.getElementById('close-auth-modal');
    const authTitle = document.getElementById('auth-title');
    const registerFields = document.getElementById('register-fields');
    const authName = document.getElementById('auth-name');
    const authEmail = document.getElementById('auth-email');
    const authPassword = document.getElementById('auth-password');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authToggleText = document.getElementById('auth-toggle-text');
    const authToggleLink = document.getElementById('auth-toggle-link');
    const authErrorMessage = document.getElementById('auth-error-message');

    let isLoginMode = true;

    if (authNavBtn) {
        authNavBtn.addEventListener('click', () => {
            const token = localStorage.getItem('eduYodhaToken');
            if (token) {
                // Logout
                localStorage.removeItem('eduYodhaToken');
                localStorage.removeItem('eduYodhaPro');
                localStorage.removeItem('eduYodhaStudentName');
                alert("Logged out successfully");
                location.reload();
            } else {
                authModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            authErrorMessage.style.display = 'none';
        });
    }

    if (authToggleLink) {
        authToggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            authErrorMessage.style.display = 'none';
            if (isLoginMode) {
                authTitle.innerText = "Sign In";
                registerFields.style.display = "none";
                authSubmitBtn.innerText = "Login";
                authToggleText.innerText = "Don't have an account?";
                authToggleLink.innerText = "Sign Up";
            } else {
                authTitle.innerText = "Create Account";
                registerFields.style.display = "block";
                authSubmitBtn.innerText = "Sign Up";
                authToggleText.innerText = "Already have an account?";
                authToggleLink.innerText = "Sign In";
            }
        });
    }

    if (authSubmitBtn) {
        authSubmitBtn.addEventListener('click', async () => {
            const email = authEmail.value.trim();
            const password = authPassword.value.trim();
            const name = authName.value.trim();

            if (!email || !password || (!isLoginMode && !name)) {
                authErrorMessage.innerText = "Please fill all fields.";
                authErrorMessage.style.display = "block";
                return;
            }

            authSubmitBtn.innerText = "Processing...";
            authSubmitBtn.disabled = true;

            const url = isLoginMode ? '/api/auth/login' : '/api/auth/register';
            const body = isLoginMode ? { email, password } : { name, email, password };

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Authentication failed");

                localStorage.setItem('eduYodhaToken', data.token);
                localStorage.setItem('eduYodhaStudentName', data.user.name);
                if (data.user.is_pro) {
                    localStorage.setItem('eduYodhaPro', 'true');
                }
                
                authModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                location.reload();
            } catch (err) {
                authErrorMessage.innerText = err.message;
                authErrorMessage.style.display = "block";
                authSubmitBtn.innerText = isLoginMode ? "Login" : "Sign Up";
                authSubmitBtn.disabled = false;
            }
        });
    }

    async function checkAuth() {
        const token = localStorage.getItem('eduYodhaToken');
        if (token) {
            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    authNavBtn.innerHTML = `<i data-lucide="user-check"></i> ${data.user.name} (Logout)`;
                    localStorage.setItem('eduYodhaStudentName', data.user.name);
                    if (data.user.is_pro) {
                        localStorage.setItem('eduYodhaPro', 'true');
                        if (goproBtn) {
                            goproBtn.innerHTML = '<i data-lucide="check-circle"></i> PRO ACTIVE';
                            goproBtn.style.pointerEvents = 'none';
                        }
                    }
                } else {
                    // Token expired or invalid
                    localStorage.removeItem('eduYodhaToken');
                    localStorage.removeItem('eduYodhaPro');
                }
            } catch (err) {
                console.error("Auth check failed");
            }
        }
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (filterDropdown) filterDropdown.addEventListener('change', applyFilters);

    checkAuth();
    loadCategories();
    loadVideos();
});
