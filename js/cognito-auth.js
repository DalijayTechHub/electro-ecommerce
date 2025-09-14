// Real Cognito authentication
class CognitoAuth {
  constructor() {
    this.currentUser = null;
    this.checkAuthState();
  }

  async checkAuthState() {
    try {
      const { getCurrentUser } = window.AmplifyAuth;
      const user = await getCurrentUser();
      this.currentUser = user;
      this.updateUI();
    } catch (error) {
      this.currentUser = null;
    }
  }

  async register(email, password, fullName) {
    try {
      const { signUp } = window.AmplifyAuth;
      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            name: fullName
          }
        }
      });
      return { success: true, needsConfirmation: !result.isSignUpComplete };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async confirmRegistration(email, code) {
    try {
      const { confirmSignUp } = window.AmplifyAuth;
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
      const { signIn } = window.AmplifyAuth;
      const user = await signIn({
        username: email,
        password: password
      });
      this.currentUser = user;
      this.updateUI();
      return { success: true, user: user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      const { signOut } = window.AmplifyAuth;
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
      const { resetPassword } = window.AmplifyAuth;
      await resetPassword({ username: email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async confirmForgotPassword(email, code, newPassword) {
    try {
      const { confirmResetPassword } = window.AmplifyAuth;
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
        userName.textContent = this.currentUser.signInDetails?.loginId || 'User';
      }
    } else if (loginLink && userMenu) {
      loginLink.style.display = 'block';
      userMenu.style.display = 'none';
    }
  }
}

window.cognitoAuth = new CognitoAuth();