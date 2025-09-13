import { getCurrentUser } from 'aws-amplify/auth';

// Auth guard for protected pages
class AuthGuard {
  static async checkAuth() {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  static async requireAuth() {
    const isAuthenticated = await this.checkAuth();
    if (!isAuthenticated) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  static async redirectIfAuthenticated() {
    const isAuthenticated = await this.checkAuth();
    if (isAuthenticated) {
      window.location.href = 'dashboard.html';
      return true;
    }
    return false;
  }
}

export default AuthGuard;