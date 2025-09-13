// Simple authentication without ES6 modules
class SimpleAuth {
  constructor() {
    this.currentUser = null;
    this.checkAuthState();
  }

  checkAuthState() {
    // Check if user was previously logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.updateUI();
    }
  }

  async register(email, password, fullName) {
    try {
      // Simulate registration - replace with actual Cognito calls when deployed
      console.log('Registration:', { email, password, fullName });
      return { success: true, needsConfirmation: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async confirmRegistration(email, code) {
    try {
      console.log('Confirming registration:', { email, code });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async login(email, password) {
    try {
      console.log('Login:', { email, password });
      this.currentUser = { username: email, attributes: { email, name: 'User' } };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      this.updateUI();
      return { success: true, user: this.currentUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      this.updateUI();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async forgotPassword(email) {
    try {
      console.log('Forgot password:', email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async confirmForgotPassword(email, code, newPassword) {
    try {
      console.log('Confirm forgot password:', { email, code, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  getUser() {
    return this.currentUser;
  }

  updateUI() {
    const loginLink = document.getElementById('loginLink');
    const userMenu = document.getElementById('userMenu');
    
    if (this.isAuthenticated() && loginLink && userMenu) {
      loginLink.style.display = 'none';
      userMenu.style.display = 'block';
      
      const userName = document.getElementById('userName');
      if (userName && this.currentUser) {
        userName.textContent = this.currentUser.attributes?.name || this.currentUser.username;
      }
    } else if (loginLink && userMenu) {
      loginLink.style.display = 'block';
      userMenu.style.display = 'none';
    }
  }
}

window.simpleAuth = new SimpleAuth();