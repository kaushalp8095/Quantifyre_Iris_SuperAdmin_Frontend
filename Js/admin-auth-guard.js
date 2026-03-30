(function () {
    const path = window.location.pathname;
    
    // 1. Storage se data uthao
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const adminName = localStorage.getItem("adminName");

    // 2. Cookie check function (Security ke liye)
    function getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Login Page ka exact name check karne ke liye helper
    const isLoginPage = path.toLowerCase().includes("superadminlogin.html");

    // --- LOGIC 1: AGAR USER LOGIN PAGE PAR HAI ---
    if (isLoginPage) {
        // Agar pehle se login hai, toh dashboard bhej do
        if (isLoggedIn === "true" && adminName) {
            console.log("Super Admin already logged in. Redirecting...");
            window.location.replace("AdminDashboard.html");
            return;
        }
        return; // Login page par hi rehne do
    }

    // --- LOGIC 2: AGAR KISI SECURE PAGE PAR HAI ---
    // Yahan hum check karenge ki data missing toh nahi hai
    if (!isLoggedIn || isLoggedIn !== "true" || !adminName) {
        console.warn("Access Denied: No Active Session.");
        
        // Saara kachra saaf karein
        localStorage.clear(); // Saare admin related keys uda dega
        
        // Cookie expire karein
        document.cookie = "isAdminLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Redirect to Login
        window.location.replace("SuperAdminLogin.html");
    }
})();