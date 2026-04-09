// ==========================================
// 1. AJAX PREFILTER (Localhost Fix)
// ==========================================
$.ajaxPrefilter(function (options) {
    var oldBase = "http://localhost:8080";
    var liveBase = "https://quantifyre-iris-superadmin-backend.onrender.com";

    if (options.url.indexOf(oldBase) !== -1) {
        options.url = options.url.replace(oldBase, liveBase);

    }
});



// Isse apni "all.js" ya main script file mein paste karein
$(document).ajaxError(function(event, jqXHR) {
    // Status 0 matlab Eclipse band hai
    if (jqXHR.status === 0) {
        console.error("Backend Offline!");
        // 🔴 Ek flag set karein taaki auth-guard ko pata chale ki server band hai
        sessionStorage.setItem("eclipse_is_down", "true");
        window.location.replace("SuperAdminLogin.html");
    }

    if (jqXHR.status === 401) {
        localStorage.clear();
        window.location.replace("SuperAdminLogin.html");
    }
});


// Sidebar Profile & Notifications Dropdown Logic //    
$(document).ready(function () {
    const $sidebar = $('.sidebar');
    const $notifDropdown = $('#notifDropdown');
    const $profileDropdown = $('#profileDropdown');
    const $chevron = $('#profileChevron');

    // --- 1. Sidebar Toggle Logic ---
    $('#sidebarToggle').click(function (e) {
        e.stopPropagation();

        $notifDropdown.removeClass('active');
        $profileDropdown.removeClass('active');
        $chevron.css('transform', 'rotate(0deg)');

        $sidebar.toggleClass('collapsed');
    });

    $('#closeSidebarBtn').click(function () {
        $sidebar.removeClass('collapsed');
    });

    // --- 2. Global Outside Click Logic (For All 3) ---
    $(document).on('click', function (event) {
        const $target = $(event.target);

        // Sidebar close logic (Responsive only)
        if (window.innerWidth <= 768) {
            if (!$target.closest('.sidebar').length && !$target.closest('#sidebarToggle').length) {
                $sidebar.removeClass('collapsed');
            }
        }
        // Notification close logic
        if (!$target.closest('.notification-wrapper').length) {
            $notifDropdown.removeClass('active');
        }

        // Profile close logic
        if (!$target.closest('.profile-info').length && !$target.closest('#profileDropdown').length) {
            $profileDropdown.removeClass('active');
            $chevron.css('transform', 'rotate(0deg)');
        }
    });
});

// --- 3. Notification Toggle ---
function toggleNotification(event) {
    event.stopPropagation();
    const notifDropdown = document.getElementById('notifDropdown');
    const profileDropdown = document.getElementById('profileDropdown');
    const chevron = document.getElementById('profileChevron');

    if (window.innerWidth <= 768) {
        $('.sidebar').removeClass('collapsed');
    }

    if (profileDropdown) {
        profileDropdown.classList.remove('active');
        if (chevron) chevron.style.transform = "rotate(0deg)";
    }

    notifDropdown.classList.toggle('active');
}

// --- 4. Profile Toggle ---
function toggleProfileDropdown(event) {
    event.stopPropagation();
    const profileDropdown = document.getElementById('profileDropdown');
    const notifDropdown = document.getElementById('notifDropdown');
    const chevron = document.getElementById('profileChevron');

    if (window.innerWidth <= 768) {
        $('.sidebar').removeClass('collapsed');
    }

    if (notifDropdown) {
        notifDropdown.classList.remove('active');
    }

    profileDropdown.classList.toggle('active');

    if (profileDropdown.classList.contains('active')) {
        chevron.style.transform = "rotate(180deg)";
    } else {
        chevron.style.transform = "rotate(0deg)";
    }
}

// ==========================================
// --- Logout Modal Logic ---
// ==========================================

function openLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.add('active');
        console.log("Logout Modal Opened");
    }

    // Modal khulte hi Profile Dropdown band kar do
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.remove('active');
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ==========================================
        // 🔴 NAYA LOGOUT LOGIC (API CALL KE SATH)
        // ==========================================
        function confirmLogout() {
            const btn = $('.btn-modal-delete1, .btn-modal-delete'); 
            btn.text('Logging out...').prop('disabled', true);

            // Backend API ko call karo cookie expire karne ke liye
            $.ajax({
                url: "http://localhost:8080/api/admin/logout",
                type: "POST",
                xhrFields: {
                    withCredentials: true // 🔴 Ye line sabse zaroori hai cookie delete karne ke liye
                },
                success: function () {
                    // Backend se cookie delete hone ke baad, Frontend ka kachra saaf karo
                    localStorage.clear();
                    window.location.replace("SuperAdminLogin.html");
                },
                error: function () {
                    // Agar server se koi error bhi aaye, tab bhi user ko bahar nikal do (Safe Side)
                    console.error("Logout API failed, but clearing local session.");
                    localStorage.clear();
                    window.location.replace("SuperAdminLogin.html");
                }
            });
        }

document.addEventListener('click', function (event) {
    const modal = document.getElementById('logoutModal');
    const modalContent = document.querySelector('.modal-content');

    if (modal && modal.classList.contains('active') && event.target === modal) {
        closeLogoutModal();
    }
});


// ---Delete & Suspend MODAL LOGIC ---//
function openDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function openSuspendModal() {
    const modal = document.getElementById('suspendModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

function confirmDelete() {
    alert("Agency Deleted Successfully!");
    closeModal('deleteModal');
}

function confirmSuspend() {
    alert("Agency Suspended Successfully!");
    closeModal('suspendModal');
}

window.onclick = function (event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('show');
        setTimeout(() => event.target.style.display = 'none', 300);
    }
}


// =========================================================
// GLOBAL PROFILE SYNC LOGIC (Runs on Every Admin Page)
// =========================================================
$(document).ready(function() {
    // 1. LocalStorage se data uthao
    const savedName = localStorage.getItem("adminName");
    const savedLogo = localStorage.getItem("adminLogo");
    const savedEmail = localStorage.getItem("adminEmail"); 

    // 2. Agar Naam save hai, toh har jagah update karo
    if (savedName && savedName !== "null" && savedName !== "") {
        $('.user-mini-profile p').text(savedName);                 // Sidebar Name
        $('.text-info h4').text(savedName);                        // Header Name
        $('.dropdown-header-info .d-name').text(savedName);        // Dropdown Name
    }

    // 3. Agar Email save hai, toh Dropdown mein update karo
    if (savedEmail && savedEmail !== "null" && savedEmail !== "") {
        $('.dropdown-header-info .d-email').text(savedEmail);      // Dropdown Email
    }

    // 4. Logo Update (Supabase URL with Default Fallback)
    if (savedLogo && savedLogo !== "null" && savedLogo !== "") {
        // Agar real logo hai toh lagao
        $('.avatar-circle img').attr('src', savedLogo);
        $('.avatar-small img').attr('src', savedLogo);
    } else {
        // Agar DB mein photo nahi hai toh default lagao
        const defaultLogo = "Images/ClientSlider.ico"; 
        $('.avatar-circle img').attr('src', defaultLogo);
        $('.avatar-small img').attr('src', defaultLogo);
    }
});



// ==========================================
        // GLOBAL KEYBOARD SHORTCUTS (ENTER & ESCAPE KEYS)
        // ==========================================
        $(document).on('keydown', function (e) {
            
            // --- 1. ENTER KEY LOGIC (For OK / Submit / Confirm) ---
            if (e.key === "Enter" || e.keyCode === 13) {
                
                // Agar Custom Alert (Success/Error) open hai
                if ($('#customAlertOverlay').hasClass('active')) {
                    e.preventDefault(); // Default form submit roke
                    $('.btn-alert-ok').click(); // OK button click kare
                }
                
                // Agar Logout Confirmation open hai
                else if ($('#logoutModal').hasClass('active') || $('#logoutModal').css('display') === 'block') {
                    e.preventDefault();
                    confirmLogout(); 
                }

                // Agar Disconnect Confirmation open hai
                else if ($('#disconnectConfirmOverlay').hasClass('active')) {
                    e.preventDefault();
                    $('#confirmDisconnectBtn').click(); 
                }

                // Agar OTP box dikh raha hai aur user OTP type kar raha hai
                else if ($('#otpVerificationBox').is(':visible') && $('#tfaOtpInput').is(':focus')) {
                    e.preventDefault();
                    $('#tfaVerifyBtn').click(); // OTP Verify button dabaye
                }
            }

            // --- 2. ESCAPE (ESC) KEY LOGIC (For Cancel / Close) ---
            if (e.key === "Escape" || e.keyCode === 27) {
                
                if ($('#customAlertOverlay').hasClass('active')) {
                    closeCustomAlert();
                }
                if ($('#logoutModal').hasClass('active') || $('#logoutModal').css('display') === 'block') {
                    closeLogoutModal();
                }
                if ($('#disconnectConfirmOverlay').hasClass('active')) {
                    closeDisconnectModal();
                }
            }
        });


        // =========================================================
// 5. GLOBAL NOTIFICATIONS LOGIC (No UI Conflicts)
// =========================================================
$(document).ready(function() {
    const adminId = localStorage.getItem("adminId");
    
    // Agar login nahi hai ya main page nahi hai toh aage mat bado
    if(!adminId || $('.main-content').length === 0) return; 

    function loadGlobalNotifications() {
        $.ajax({
            url: `http://localhost:8080/api/admin/top-notifications/get/${adminId}`,
            type: "GET",
            success: function (res) {
                // 1. Update Bell Icon Count
                if (res.unreadCount > 0) {
                    $('.notif-count').text(res.unreadCount).show();
                } else {
                    $('.notif-count').hide();
                }

                // 2. Update Dropdown List
                const listUI = $('.notif-list');
                listUI.empty();

                if (res.notifications.length === 0) {
                    listUI.append('<li class="notif-item" style="justify-content:center; padding:15px; color:#888;">No new notifications</li>');
                    return;
                }

                // Top 5 notifications in dropdown
                const top5 = res.notifications.slice(0, 5); 
                top5.forEach(log => {
                    let iconClass = "info";
                    let iconHtml = '<i class="fa-solid fa-bell"></i>';

                    if (log.type === "SUCCESS") { iconClass = "success"; iconHtml = '<i class="fa-solid fa-check"></i>'; } 
                    else if (log.type === "INFO") { iconClass = "info"; iconHtml = '<i class="fa-solid fa-user-plus"></i>'; } 
                    else if (log.type === "WARNING" || log.type === "ERROR") { iconClass = "warning"; iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>'; }

                    let readClass = log.read ? "" : "unread";

                    // Note: Yahan pehle wale timeAgo function ki jagah maine simple text daal diya hai taaki conflict na ho. 
                    // Aap chahein toh apna timeAgo yahan use kar sakte hain.
                    let html = `
                        <li class="notif-item ${readClass}">
                            <div class="n-icon ${iconClass}">${iconHtml}</div>
                            <div class="n-text">
                                <p><strong>${log.title}</strong></p><span>${log.message}</span>
                            </div>
                            <span class="n-time" style="font-size:0.7rem; color:#888;">${timeAgo(log.createdAt)}</span>
                        </li>
                    `;
                    listUI.append(html);
                });
            }
        });
    }

    // 3. Mark All as Read Logic (Dynamic binding to avoid conflicts)
    $(document).on('click', '.mark-read, #markAllReadBtn', function(e) {
    e.stopPropagation();
    
    $.ajax({
        url: `http://localhost:8080/api/admin/top-notifications/mark-read/${adminId}`,
        type: "POST",
        success: function() {
            // 1. Header ke dropdown se 'unread' class hatao
            $('.notif-list .notif-item').removeClass('unread');
            
            // 2. Agar user "All Notifications" page par hai, toh wahan ki list se bhi hatao
            $('.full-notif-item').removeClass('unread');
            
            // 3. Red badge (count) ko hide kar do
            $('.notif-count').hide();

            // 4. Local array ko bhi update kar do taaki filter sahi chale
            if (typeof allNotifications !== 'undefined') {
                allNotifications.forEach(n => n.read = true);
            }
        }
    });
});

    // Run when page loads
    loadGlobalNotifications();
});


// --- Helper Function: Time Calculation ---
    function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.round((now - date) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }