// Real Cognito authentication
class CognitoAuth {
  constructor() {
    this.currentUser = null;
    this.checkAuthState();
  }

  async checkAuthState() {
    try {
      const user = await window.aws_amplify.getCurrentUser();
      this.currentUser = user;
      this.updateUI();
    } catch (error) {
      this.currentUser = null;
    }
  }

  async register(email, password, fullName) {
    try {
      const result = await window.aws_amplify.signUp({
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
      await window.aws_amplify.confirmSignUp({
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
      const user = await window.aws_amplify.signIn({
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
      await window.aws_amplify.signOut();
      this.currentUser = null;
      this.updateUI();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async forgotPassword(email) {
    try {
      await window.aws_amplify.resetPassword({ username: email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async confirmForgotPassword(email, code, newPassword) {
    try {
      await window.aws_amplify.confirmResetPassword({
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
      await window.aws_amplify.resendSignUpCode({ username: email });
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