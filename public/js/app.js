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

    // Dummy Premium Content
    const premiumVideos = [
        { id: 9991, title: "Advanced Placements PREP 2026", youtube_id: "ukzFI9rgwfU", category: "PREMIUM PRO", description: "Exclusive for PRO members." },
        { id: 9992, title: "1-on-1 Mentorship Session 1", youtube_id: "dQw4w9WgXcQ", category: "PREMIUM PRO", description: "Exclusive for PRO members." }
    ];

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
                if(!allCategories.includes('PREMIUM PRO')) allCategories.push('PREMIUM PRO');
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
            
            if(cat === 'PREMIUM PRO') {
                btn.innerHTML = '💎 ' + cat;
                btn.style.background = 'linear-gradient(90deg, #b92b27, #1565C0)';
                btn.style.color = '#fff';
            } else {
                btn.textContent = cat === 'All' ? 'All Videos' : cat.replace(/_/g, ' ');
            }

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
            if(category === 'PREMIUM PRO') {
                window.currentVideos = premiumVideos;
            } else {
                let url = '/api/videos';
                if (category !== 'All') url += `?category=${encodeURIComponent(category)}`;
                const res = await fetch(url);
                window.currentVideos = await res.json();
            }
            
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

            card.innerHTML = `
                <div class="video-wrapper">
                    <iframe src="https://www.youtube.com/embed/${video.youtube_id}" title="${video.title}" allowfullscreen></iframe>
                </div>
                <div class="video-info">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                         <span class="video-category">${video.category.replace(/_/g, ' ')}</span>
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
        if (window.currentCategory === 'All' || window.currentCategory === 'PREMIUM PRO') {
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
            if(window.confetti && !window.celebrated) {
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
            namePromptSection.style.display = 'block';
            certDisplaySection.style.display = 'none';
            document.body.style.overflow = 'hidden';
            const savedName = localStorage.getItem('eduYodhaStudentName');
            if (savedName) studentNameInput.value = savedName;
        });
    }

    if(closeModal) closeModal.addEventListener('click', () => { certModal.style.display = 'none'; document.body.style.overflow = 'auto';});
    
    if(generateCertBtn) {
        generateCertBtn.addEventListener('click', () => {
            const name = studentNameInput.value.trim();
            if (!name) return alert('Please enter your name to generate the certificate.');
            localStorage.setItem('eduYodhaStudentName', name);
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
                alert("Payment Successful! You are now an EDU YODHA PRO member. 'PREMIUM PRO' category unlocked!");
                location.reload();
            }, 1500);
        });
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (filterDropdown) filterDropdown.addEventListener('change', applyFilters);

    loadCategories();
    loadVideos();
});
