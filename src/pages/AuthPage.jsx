import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupAllowed, setSignupAllowed] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    api.get('/auth/signup-allowed').then(function(res) {
      setSignupAllowed(res.data.allowed);
    }).catch(function() {
      setSignupAllowed(false);
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(registerForm.name, registerForm.email, registerForm.password);
      toast.success('Account created! You are the admin.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  var defaultTab = signupAllowed ? 'register' : 'login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4" data-testid="auth-page">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary tracking-tight" data-testid="auth-logo">
            Tempo
          </h1>
          <p className="text-muted-foreground mt-2 font-body text-base">
            Manage your repetitive tasks with rhythm
          </p>
        </div>

        <Card className="rounded-2xl border border-border shadow-lg" data-testid="auth-card">
          {signupAllowed === null ? (
            <CardContent className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </CardContent>
          ) : signupAllowed ? (
            <Tabs defaultValue="register" className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2 rounded-full" data-testid="auth-tabs">
                  <TabsTrigger value="login" className="rounded-full font-heading" data-testid="login-tab">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="register" className="rounded-full font-heading" data-testid="register-tab">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="login">
                  <LoginForm form={loginForm} setForm={setLoginForm} loading={loading} showPassword={showPassword} setShowPassword={setShowPassword} onSubmit={handleLogin} />
                </TabsContent>
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                    <p className="text-sm text-muted-foreground font-body bg-primary/5 rounded-xl p-3 border border-primary/10">
                      You'll be the first user and admin of this Tempo instance.
                    </p>
                    <div className="space-y-2">
                      <Label className="font-heading text-sm font-medium">Name</Label>
                      <Input
                        type="text"
                        placeholder="Your name"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200"
                        data-testid="register-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-heading text-sm font-medium">Email</Label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200"
                        data-testid="register-email-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-heading text-sm font-medium">Password</Label>
                      <Input
                        type="password"
                        placeholder="Min 6 characters"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200"
                        data-testid="register-password-input"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full font-heading font-bold text-base h-11 shadow-lg hover:shadow-xl transition-all duration-300"
                      data-testid="register-submit-button"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Create Admin Account
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          ) : (
            <div>
              <CardHeader className="pb-4">
                <h2 className="font-heading text-xl font-bold text-center">Sign In</h2>
                <p className="text-sm text-muted-foreground text-center font-body">
                  New users must be invited by an admin
                </p>
              </CardHeader>
              <CardContent>
                <LoginForm form={loginForm} setForm={setLoginForm} loading={loading} showPassword={showPassword} setShowPassword={setShowPassword} onSubmit={handleLogin} />
              </CardContent>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function LoginForm({ form, setForm, loading, showPassword, setShowPassword, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form">
      <div className="space-y-2">
        <Label className="font-heading text-sm font-medium">Email</Label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200"
          data-testid="login-email-input"
        />
      </div>
      <div className="space-y-2">
        <Label className="font-heading text-sm font-medium">Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200 pr-10"
            data-testid="login-password-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="toggle-password-visibility"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full font-heading font-bold text-base h-11 shadow-lg hover:shadow-xl transition-all duration-300"
        data-testid="login-submit-button"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Sign In
      </Button>
    </form>
  );
}
