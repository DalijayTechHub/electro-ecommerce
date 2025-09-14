// Authentication state checker for all pages
function checkAuthState() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userEmail = localStorage.getItem('userEmail');
    
    const loginLink = document.getElementById('loginLink');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileUserMenu = document.getElementById('mobileUserMenu');
    const mobileUserName = document.getElementById('mobileUserName');
    
    if (isAuthenticated && userEmail) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userName) userName.textContent = userEmail.split('@')[0];
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
        if (mobileUserMenu) mobileUserMenu.classList.remove('d-none');
        if (mobileUserName) mobileUserName.textContent = userEmail.split('@')[0];
    } else {
        // User is not logged in
        if (loginLink) loginLink.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
        if (mobileUserMenu) mobileUserMenu.classList.add('d-none');
    }
}

// Global logout function
window.logout = function() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('accessToken');
    window.location.href = 'index.html';
};

// Check auth state on page load
document.addEventListener('DOMContentLoaded', checkAuthState);