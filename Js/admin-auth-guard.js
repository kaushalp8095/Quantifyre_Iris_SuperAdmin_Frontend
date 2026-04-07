(function () {
    const path = window.location.pathname;
    
    // 1. Storage se data uthao
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const adminName = localStorage.getItem("adminName");
    const loginTime = localStorage.getItem("loginTime"); // Login ke time jo time save kiya tha

    // 🔴 2. Session Expiry Logic (1 Day = 24 Hours)
    const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 Ghante milliseconds mein
    let isSessionExpired = false;

    if (loginTime) {
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - parseInt(loginTime);
        
        // Agar 24 ghante se zyada ho gaya, toh session expire maan lo
        if (timeDifference > ONE_DAY_IN_MS) {
            isSessionExpired = true; 
        }
    }

    // Login Page ka exact name check karne ke liye helper
    const isLoginPage = path.toLowerCase().includes("superadminlogin.html");

    // --- LOGIC 1: AGAR USER LOGIN PAGE PAR HAI ---
    if (isLoginPage) {
        // Agar pehle se login hai aur session expire NAHI hua hai
        if (isLoggedIn === "true" && adminName && !isSessionExpired) {
            window.location.replace("AdminDashboard.html");
            return;
        }
        
        // Agar session expire ho gaya hai toh purana kachra saaf karo, par login page par hi raho
        if(isSessionExpired) {
            localStorage.clear();
        }
        return; 
    }

    // --- LOGIC 2: AGAR KISI SECURE PAGE PAR HAI ---
    // Agar login data nahi hai, ya phir 24 ghante pure ho chuke hain (isSessionExpired)
    if (!isLoggedIn || isLoggedIn !== "true" || !adminName || isSessionExpired) {
        console.warn("Access Denied: Session Expired or No Active Session.");
        
        // Saara kachra saaf karein
        localStorage.clear(); 
        
        // Redirect to Login
        window.location.replace("SuperAdminLogin.html");
    }
})();

async function validateServerConnection() {
    try {
        // Ek simple GET call backend ko (Jaise profile ya health check)
        const response = await fetch("http://localhost:8080/api/admin/settings/profile/1", {
            method: 'GET',
            // Timeout set karein taaki user ko zyada wait na karna pade
            signal: AbortSignal.timeout(2000) 
        });

        if (!response.ok) {
            throw new Error("Server down");
        }
    } catch (error) {
        console.error("Server is unreachable. Redirecting to login...");
        // 🔴 Agar server (Eclipse) band hai toh sab saaf karke bhaga do
        localStorage.clear();
        window.location.replace("SuperAdminLogin.html");
    }
}

// Ise page load hote hi turant chalao
if (localStorage.getItem("isAdminLoggedIn") === "true") {
    validateServerConnection();
}