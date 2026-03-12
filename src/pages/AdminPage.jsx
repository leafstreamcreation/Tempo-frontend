import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog.jsx';
import { toast } from 'sonner';
import {
  Users, Mail, Shield, ShieldOff, Trash2, Copy, Loader2, Send, Link2, CheckCircle2, XCircle
} from 'lucide-react';

function UserRow({ userId, name, email, createdAt, isAdmin, isSelf, onToggleAdmin, onDelete }) {
  return (
    <Card className="rounded-2xl border border-border" data-testid={'user-row-' + userId}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary font-heading">
              {name ? name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-semibold text-sm">{name}</h3>
              {isAdmin ? (
                <Badge className="rounded-full text-[10px] font-heading bg-primary text-primary-foreground" data-testid={'admin-badge-' + userId}>
                  Admin
                </Badge>
              ) : null}
              {isSelf ? (
                <Badge variant="outline" className="rounded-full text-[10px] font-heading" data-testid="you-badge">
                  You
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground font-body">{email}</p>
          </div>
          {!isSelf ? (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleAdmin}
                className="rounded-full"
                data-testid={'toggle-admin-' + userId}
                aria-label={isAdmin ? 'Remove admin' : 'Make admin'}
                title={isAdmin ? 'Remove admin' : 'Make admin'}
              >
                {isAdmin ? <ShieldOff className="w-4 h-4 text-status-soon" /> : <Shield className="w-4 h-4 text-muted-foreground" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="rounded-full text-destructive hover:text-destructive"
                data-testid={'delete-user-' + userId}
                aria-label="Delete user"
                title="Delete user"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function InviteRow({ inviteId, email, createdByName, createdAt, used, inviteToken, onRevoke, onCopy }) {
  return (
    <Card className="rounded-2xl border border-border" data-testid={'invite-row-' + inviteId}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={'w-10 h-10 rounded-full flex items-center justify-center shrink-0 ' + (used ? 'bg-status-safe/10' : 'bg-primary/10')}>
            {used ? <CheckCircle2 className="w-5 h-5 text-status-safe" /> : <Mail className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-semibold text-sm">{email}</h3>
              {used ? (
                <Badge className="rounded-full text-[10px] font-heading bg-status-safe text-white">Used</Badge>
              ) : (
                <Badge variant="outline" className="rounded-full text-[10px] font-heading border-status-soon text-status-soon">Pending</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-body">
              Invited by {createdByName}
            </p>
          </div>
          {!used ? (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onCopy}
                className="rounded-full"
                data-testid={'copy-invite-' + inviteId}
                aria-label="Copy invite link"
                title="Copy invite link"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRevoke}
                className="rounded-full text-destructive hover:text-destructive"
                data-testid={'revoke-invite-' + inviteId}
                aria-label="Revoke invitation"
                title="Revoke invitation"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  var authCtx = useAuth();
  var currentUser = authCtx.user;

  var usersState = useState([]);
  var users = usersState[0];
  var setUsers = usersState[1];
  var invitesState = useState([]);
  var invites = invitesState[0];
  var setInvites = invitesState[1];
  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var inviteEmailState = useState('');
  var inviteEmail = inviteEmailState[0];
  var setInviteEmail = inviteEmailState[1];
  var sendingState = useState(false);
  var sending = sendingState[0];
  var setSending = sendingState[1];
  var deleteDialogState = useState(false);
  var deleteOpen = deleteDialogState[0];
  var setDeleteOpen = deleteDialogState[1];
  var deletingUserState = useState(null);
  var deletingUser = deletingUserState[0];
  var setDeletingUser = deletingUserState[1];

  var fetchData = useCallback(async function() {
    try {
      var results = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/invitations'),
      ]);
      setUsers(results[0].data);
      setInvites(results[1].data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function() { fetchData(); }, [fetchData]);

  var copyToClipboard = function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        toast.success('Invite link copied to clipboard');
      }).catch(function() {
        prompt('Copy this invite link:', text);
      });
    } else {
      prompt('Copy this invite link:', text);
    }
  };

  var handleInvite = async function(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) { toast.error('Email is required'); return; }
    setSending(true);
    try {
      var res = await api.post('/admin/invite', { email: inviteEmail.trim() });
      var link = window.location.origin + '/invite/' + res.data.token;
      copyToClipboard(link);
      toast.success('Invitation created!');
      setInviteEmail('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create invitation');
    } finally {
      setSending(false);
    }
  };

  var handleCopyLink = function(token) {
    var link = window.location.origin + '/invite/' + token;
    copyToClipboard(link);
  };

  var handleToggleAdmin = async function(userId) {
    try {
      var res = await api.put('/admin/users/' + userId + '/toggle-admin');
      var newStatus = res.data.is_admin ? 'admin' : 'member';
      toast.success('User is now ' + newStatus);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to toggle admin');
    }
  };

  var handleDeleteUser = async function() {
    if (!deletingUser) return;
    try {
      await api.delete('/admin/users/' + deletingUser.id);
      toast.success('User deleted');
      setDeleteOpen(false);
      setDeletingUser(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  var handleRevokeInvite = async function(inviteId) {
    try {
      await api.delete('/admin/invitations/' + inviteId);
      toast.success('Invitation revoked');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to revoke invitation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="admin-loading">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  var adminCount = 0;
  for (var i = 0; i < users.length; i++) {
    if (users[i].is_admin) adminCount++;
  }
  var pendingCount = 0;
  for (var j = 0; j < invites.length; j++) {
    if (!invites[j].used) pendingCount++;
  }

  return (
    <div className="space-y-8" data-testid="admin-page">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight" data-testid="admin-heading">
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1 font-body text-base">
          {users.length} user{users.length !== 1 ? 's' : ''} · {adminCount} admin{adminCount !== 1 ? 's' : ''} · {pendingCount} pending invite{pendingCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Invite Section */}
      <Card className="rounded-2xl border border-border" data-testid="invite-section">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Invite New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-2" data-testid="invite-form">
            <Input
              type="email"
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={function(e) { setInviteEmail(e.target.value); }}
              className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200 flex-1"
              data-testid="invite-email-input"
            />
            <Button
              type="submit"
              disabled={sending}
              className="rounded-full font-heading font-bold px-6 shadow-lg hover:shadow-xl transition-all duration-300 shrink-0"
              data-testid="invite-submit-button"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Link2 className="w-4 h-4 mr-1" />}
              Invite
            </Button>
          </form>
          <p className="text-xs text-muted-foreground font-body mt-2">
            A unique invite link will be generated and copied to your clipboard.
          </p>
        </CardContent>
      </Card>

      {/* Users Section */}
      <div>
        <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2" data-testid="users-heading">
          <Users className="w-5 h-5 text-primary" />
          Users ({users.length})
        </h2>
        <div className="space-y-2" data-testid="users-list">
          {users.map(function(u) {
            return (
              <UserRow
                key={u.id}
                userId={u.id}
                name={u.name}
                email={u.email}
                createdAt={u.created_at}
                isAdmin={u.is_admin}
                isSelf={currentUser && u.id === currentUser.id}
                onToggleAdmin={function() { handleToggleAdmin(u.id); }}
                onDelete={function() { setDeletingUser(u); setDeleteOpen(true); }}
              />
            );
          })}
        </div>
      </div>

      {/* Invitations Section */}
      {invites.length > 0 ? (
        <div>
          <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2" data-testid="invites-heading">
            <Mail className="w-5 h-5 text-primary" />
            Invitations ({invites.length})
          </h2>
          <div className="space-y-2" data-testid="invites-list">
            {invites.map(function(inv) {
              return (
                <InviteRow
                  key={inv.id}
                  inviteId={inv.id}
                  email={inv.email}
                  createdByName={inv.created_by_name}
                  createdAt={inv.created_at}
                  used={inv.used}
                  inviteToken={inv.token}
                  onRevoke={function() { handleRevokeInvite(inv.id); }}
                  onCopy={function() { handleCopyLink(inv.token); }}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Delete User Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl max-w-sm mx-4" data-testid="delete-user-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">Delete User?</DialogTitle>
            <DialogDescription className="font-body">
              This will permanently remove this user and their personal tasks. Shared tasks will remain.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={function() { setDeleteOpen(false); }}
              className="rounded-full font-heading"
              data-testid="cancel-delete-user"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              className="rounded-full font-heading"
              data-testid="confirm-delete-user"
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
