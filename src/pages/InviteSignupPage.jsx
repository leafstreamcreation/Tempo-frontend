import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Card, CardContent, CardHeader } from '../components/ui/card.jsx';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Mail } from 'lucide-react';
import api from '../lib/api';

export default function InviteSignupPage() {
  var params = useParams();
  var inviteToken = params.token;
  var navigate = useNavigate();
  var authCtx = useAuth();
  var registerInvite = authCtx.registerInvite;

  var validatingState = useState(true);
  var validating = validatingState[0];
  var setValidating = validatingState[1];

  var inviteState = useState(null);
  var invite = inviteState[0];
  var setInvite = inviteState[1];

  var errorState = useState('');
  var error = errorState[0];
  var setError = errorState[1];

  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var formState = useState({ name: '', password: '' });
  var form = formState[0];
  var setForm = formState[1];

  useEffect(function() {
    api.get('/auth/invite/' + inviteToken).then(function(res) {
      setInvite(res.data);
      setValidating(false);
    }).catch(function(err) {
      setError(err.response?.data?.detail || 'Invalid or expired invitation');
      setValidating(false);
    });
  }, [inviteToken]);

  var handleSubmit = async function(e) {
    e.preventDefault();
    if (!form.name || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await registerInvite(inviteToken, form.name, form.password);
      toast.success('Welcome to Tempo!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30" data-testid="invite-loading">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4" data-testid="invite-signup-page">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary tracking-tight" data-testid="invite-logo">
            Tempo
          </h1>
          <p className="text-muted-foreground mt-2 font-body text-base">
            You've been invited to join
          </p>
        </div>

        <Card className="rounded-2xl border border-border shadow-lg" data-testid="invite-card">
          {error ? (
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
              <h3 className="font-heading text-lg font-semibold mb-2">Invalid Invitation</h3>
              <p className="text-muted-foreground font-body mb-4" data-testid="invite-error">{error}</p>
              <Button
                onClick={function() { navigate('/login'); }}
                variant="secondary"
                className="rounded-full font-heading"
                data-testid="go-to-login-btn"
              >
                Go to Login
              </Button>
            </CardContent>
          ) : (
            <div>
              <CardHeader className="pb-4">
                <h2 className="font-heading text-xl font-bold text-center">Create Your Account</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary mb-4" data-testid="invite-email-display">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-body font-medium">{invite ? invite.email : ''}</span>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="invite-signup-form">
                  <div className="space-y-2">
                    <Label className="font-heading text-sm font-medium">Name</Label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={function(e) { setForm({ name: e.target.value, password: form.password }); }}
                      className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200"
                      data-testid="invite-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-heading text-sm font-medium">Password</Label>
                    <Input
                      type="password"
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={function(e) { setForm({ name: form.name, password: e.target.value }); }}
                      className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200"
                      data-testid="invite-password-input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full font-heading font-bold text-base h-11 shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid="invite-submit-button"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Join Tempo
                  </Button>
                </form>
              </CardContent>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
