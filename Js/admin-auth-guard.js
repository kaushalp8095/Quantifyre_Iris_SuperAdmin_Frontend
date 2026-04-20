(function () {
    // ✅ JS cookie reader
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    const path = window.location.pathname;
    const isLoginPage = path.toLowerCase().includes("superadminlogin.html");

    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const adminId = localStorage.getItem("adminId");
    const loginTime = localStorage.getItem("loginTime"); // Backend se aayi hui timestamp

    // ✅ KEY FIX: Cookie delete hui? → Force logout
    const cookiePresent = getCookie("isAdminLoggedIn");
    if (isLoggedIn === "true" && !cookiePresent) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("SuperAdminLogin.html");
        return;
    }

    // 1. ⏰ FRONTEND SESSION EXPIRY (24 Hours Check)
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (isLoggedIn === "true" && loginTime) {
        const currentTime = new Date().getTime();
        const timeElapsed = currentTime - parseInt(loginTime);

        if (timeElapsed > ONE_DAY) {
            console.warn("Session Expired (Frontend)");
            localStorage.clear();
            sessionStorage.clear();
            document.cookie = "isAdminLoggedIn=; path=/; max-age=0; SameSite=Lax";
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

})();