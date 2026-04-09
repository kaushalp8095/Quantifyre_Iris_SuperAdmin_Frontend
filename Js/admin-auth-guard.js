(function () {
    const path = window.location.pathname;
    const isLoginPage = path.toLowerCase().includes("superadminlogin.html");
    
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const adminId = localStorage.getItem("adminId") || "1";
    const loginTime = localStorage.getItem("loginTime");

    // 1. ⏰ Session Expiry Check
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (loginTime && (new Date().getTime() - parseInt(loginTime) > ONE_DAY)) {
        localStorage.clear();
        if (!isLoginPage) window.location.replace("SuperAdminLogin.html");
        return;
    }

    // 2. 🛡️ Loop Protection Flag
    const isDown = sessionStorage.getItem("eclipse_is_down") === "true";

    // 3. 🚀 Login Page Logic
    if (isLoginPage) {
        if (isLoggedIn === "true") {
            if (isDown) return; // Server band hai toh yahi ruko

            fetch(`https://quantifyre-iris-superadmin-backend.onrender.com/api/admin/settings/profile/${adminId}`)
                .then(res => {
                    if (res.ok) {
                        sessionStorage.removeItem("eclipse_is_down");
                        window.location.replace("AdminDashboard.html");
                    }
                })
                .catch(() => sessionStorage.setItem("eclipse_is_down", "true"));
        }
        return;
    }

    // 4. 🔒 Secure Page Check (DASHBOARD/AGENCIES PAR CHECK)
    if (isLoggedIn !== "true" || !adminId) {
        window.location.replace("SuperAdminLogin.html");
        return;
    }

    // 🔴 NEW: Agar user Dashboard/Agencies par hai, toh turant check karo Eclipse UP hai ya nahi
    // Iske bina page khula reh jayega chahe Eclipse band ho
    fetch(`https://quantifyre-iris-superadmin-backend.onrender.com/api/admin/settings/profile/${adminId}`, { priority: 'high' })
        .then(res => {
            if (!res.ok) throw new Error();
            sessionStorage.removeItem("eclipse_is_down");
        })
        .catch(() => {
            // 🚨 ECLIPSE BAND HAI! Turant bahar nikalo
            console.error("Eclipse is STOPPED. Redirecting to Login...");
            sessionStorage.setItem("eclipse_is_down", "true");
            window.location.replace("SuperAdminLogin.html");
        });
})();