import { signUp, signIn, signOut, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.checkAuthState();
  }

  async checkAuthState() {
    try {
      const user = await getCurrentUser();
      this.currentUser = user;
      this.updateUI();
    } catch (error) {
      this.currentUser = null;
      this.updateUI();
    }
  }

  async register(email, password, fullName) {
    try {
      const { user } = await signUp({
        username: email,
        password: password,
        attributes: {
          email: email,
          name: fullName
        }
      });
      return { success: true, user, needsConfirmation: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async confirmRegistration(email, code) {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async login(email, password) {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password: password
      });
      
      if (isSignedIn) {
        await this.checkAuthState();
        return { success: true, user: this.currentUser };
      } else {
        return { success: false, error: 'Sign in incomplete', nextStep };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await signOut();
      this.currentUser = null;
      this.updateUI();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async forgotPassword(email) {
    try {
      await resetPassword({ username: email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async confirmForgotPassword(email, code, newPassword) {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async resendConfirmationCode(email) {
    try {
      await resendSignUpCode({ username: email });
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
    // Update navigation based on auth state
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

// Create global auth service instance
window.authService = new AuthService();

export default AuthService;