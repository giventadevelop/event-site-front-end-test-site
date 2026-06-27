/**
 * Authentication Flow Integration Tests
 *
 * End-to-end tests for authentication flows
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/contexts';
import { SignInForm, SignUpForm, ProtectedRoute } from '@/components/auth';
import { authenticationService } from '@/services/auth';

// Mock authentication service
jest.mock('@/services/auth', () => ({
  authenticationService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    getCurrentUser: jest.fn(),
    signOut: jest.fn(),
  },
  tokenService: {
    isAuthenticated: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    getAccessToken: jest.fn(),
  },
}));

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign In Flow', () => {
    it('should complete sign-in flow successfully', async () => {
      const mockResponse = {
        accessToken: 'token_123',
        expiresIn: 3600,
        user: {
          id: 'user_123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      (authenticationService.signIn as jest.Mock).mockResolvedValue(mockResponse);
      (authenticationService.getCurrentUser as jest.Mock).mockResolvedValue(mockResponse.user);

      render(
        <AuthProvider>
          <SignInForm />
        </AuthProvider>
      );

      // Fill in form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      // Verify sign-in called
      await waitFor(() => {
        expect(authenticationService.signIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123',
          rememberMe: false,
        });
      });
    });

    it('should display error on sign-in failure', async () => {
      (authenticationService.signIn as jest.Mock).mockRejectedValue({
        status: 401,
        data: { message: 'Invalid credentials' },
      });
      (authenticationService.getCurrentUser as jest.Mock).mockResolvedValue(null);

      render(
        <AuthProvider>
          <SignInForm />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      // Error should be displayed
      await waitFor(() => {
        expect(screen.getByText(/invalid/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sign Up Flow', () => {
    it('should complete sign-up flow successfully', async () => {
      const mockResponse = {
        accessToken: 'token_123',
        expiresIn: 3600,
        user: {
          id: 'user_123',
          email: 'newuser@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      };

      (authenticationService.signUp as jest.Mock).mockResolvedValue(mockResponse);
      (authenticationService.getCurrentUser as jest.Mock).mockResolvedValue(mockResponse.user);

      render(
        <AuthProvider>
          <SignUpForm />
        </AuthProvider>
      );

      // Fill in form
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Smith' } });
      fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'newuser@example.com' } });
      fireEvent.change(screen.getByLabelText(/^password \*/i), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123' } });

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      // Verify sign-up called
      await waitFor(() => {
        expect(authenticationService.signUp).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'Password123',
          firstName: 'Jane',
          lastName: 'Smith',
        });
      });
    });

    it('should validate password confirmation', async () => {
      (authenticationService.getCurrentUser as jest.Mock).mockResolvedValue(null);

      render(
        <AuthProvider>
          <SignUpForm />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Smith' } });
      fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/^password \*/i), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'DifferentPassword' } });

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      // Should not call sign-up
      expect(authenticationService.signUp).not.toHaveBeenCalled();
    });
  });

  describe('Protected Route Flow', () => {
    it('should render content for authenticated users', async () => {
      (authenticationService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
      });

      render(
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should show loading for unauthenticated users', async () => {
      (authenticationService.getCurrentUser as jest.Mock).mockResolvedValue(null);

      render(
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      );

      // Should show loading initially
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });
});


