(function () {
    const path = window.location.pathname;
    const isLoginPage = path.toLowerCase().includes("superadminlogin.html");
    
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const adminId = localStorage.getItem("adminId");
    const loginTime = localStorage.getItem("loginTime"); // Backend se aayi hui timestamp

    // 1. ⏰ FRONTEND SESSION EXPIRY (24 Hours Check)
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (isLoggedIn === "true" && loginTime) {
        const currentTime = new Date().getTime();
        const timeElapsed = currentTime - parseInt(loginTime);

        if (timeElapsed > ONE_DAY) {
            console.warn("Session Expired (Frontend)");
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("SuperAdminLogin.html");
            return;
        }
    }

    // 2. 🛡️ LOGIN PAGE LOGIC
    if (isLoginPage) {
        // Agar pehle se logged in hai toh dashboard bhej do
        if (isLoggedIn === "true" && adminId) {
            window.location.replace("AdminDashboard.html");
        }
        return;
    }

    // 3. 🔒 SECURE PAGE PROTECTION
    // Agar user logged in nahi hai toh login page par fenko
    if (isLoggedIn !== "true" || !adminId) {
        localStorage.clear();
        window.location.replace("SuperAdminLogin.html");
        return;
    }

    // 4. 🔴 BACKEND SESSION & STATUS CHECK
    // Har page load par backend se pucho ki "Main valid hoon ya nahi?"
    fetch(`https://quantifyre-iris-superadmin-backend.onrender.com/api/admin/settings/profile/${adminId}`, { 
        priority: 'high',
        headers: { 'Cache-Control': 'no-cache' }
    })
    .then(res => {
        // Agar Backend 401 (Unauthorized) ya 404 bhej raha hai
        if (res.status === 401 || res.status === 403) {
            console.error("Backend Session Expired!");
            throw new Error("UNAUTHORIZED");
        }
        if (!res.ok) throw new Error("SERVER_DOWN");
        
        sessionStorage.removeItem("eclipse_is_down");
    })
    .catch((err) => {
        if (err.message === "UNAUTHORIZED") {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("SuperAdminLogin.html?error=session_expired");
        } else {
            // Server down hai toh dashboard par warning ya redirect handle karein
            console.error("Backend unreachable!");
            sessionStorage.setItem("eclipse_is_down", "true");
        }
    });
})();