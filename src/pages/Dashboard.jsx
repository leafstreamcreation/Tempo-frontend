import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import api from '@/lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, CalendarDays, Repeat, Users } from 'lucide-react';
import { formatDistanceToNow, isPast, differenceInDays, differenceInHours } from 'date-fns';

function getTaskStatus(nextDue) {
  var now = new Date();
  var due = new Date(nextDue);
  if (isPast(due)) return 'overdue';
  var hoursUntil = differenceInHours(due, now);
  if (hoursUntil < 24) return 'urgent';
  var daysUntil = differenceInDays(due, now);
  if (daysUntil <= 3) return 'soon';
  return 'safe';
}

function getStatusColor(status) {
  if (status === 'overdue') return 'bg-[#9F1239] text-white';
  if (status === 'urgent') return 'bg-status-urgent text-white';
  if (status === 'soon') return 'bg-status-soon text-white';
  if (status === 'safe') return 'bg-status-safe text-white';
  return 'bg-muted text-foreground';
}

function getBorderClass(status) {
  if (status === 'overdue') return 'task-border-overdue';
  if (status === 'urgent') return 'task-border-urgent';
  if (status === 'soon') return 'task-border-soon';
  if (status === 'safe') return 'task-border-safe';
  return '';
}

function getDueText(nextDue) {
  var due = new Date(nextDue);
  if (isPast(due)) return 'Overdue by ' + formatDistanceToNow(due);
  return 'Due ' + formatDistanceToNow(due, { addSuffix: true });
}

function TagList({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {items.map(function(tag) {
        return (
          <Badge key={tag} variant="secondary" className="rounded-full text-[10px] font-body">
            {tag}
          </Badge>
        );
      })}
    </div>
  );
}

function HeroTagList({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {items.map(function(tag) {
        return (
          <Badge key={tag} variant="secondary" className="rounded-full font-body text-xs" data-testid={'hero-tag-' + tag}>
            {tag}
          </Badge>
        );
      })}
    </div>
  );
}

function StatCard({ icon, value, label, testId }) {
  return (
    <Card className="rounded-2xl border border-border" data-testid={testId}>
      <CardContent className="p-4 flex items-center gap-3">
        {icon}
        <div>
          <p className="text-2xl font-bold font-heading">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskRow({ taskId, title, nextDue, intervalDays, tags, isShared, ownerName, onClick }) {
  var status = getTaskStatus(nextDue);
  var isOverdue = status === 'overdue';
  var cardClass = 'rounded-2xl border border-border ' + getBorderClass(status)
    + (isOverdue ? ' animate-pulse-overdue' : '')
    + ' hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5';

  return (
    <Card className={cardClass} onClick={onClick} data-testid={'task-card-' + taskId}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading font-semibold text-base truncate">{title}</h3>
            {isShared ? (
              <Badge variant="outline" className="rounded-full text-[10px] font-heading shrink-0 border-blue-400 text-blue-600 dark:text-blue-400 gap-0.5" data-testid={'shared-badge-' + taskId}>
                <Users className="w-3 h-3" /> Shared
              </Badge>
            ) : null}
            <Badge className={'rounded-full text-[10px] font-heading shrink-0 ' + getStatusColor(status)}>
              {status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            {getDueText(nextDue)} · Every {intervalDays}d
            {isShared && ownerName ? ' · by ' + ownerName : ''}
          </p>
          <TagList items={tags} />
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
}

function HeroCard({ title, description, nextDue, intervalDays, tags, isShared, ownerName, onComplete }) {
  var status = getTaskStatus(nextDue);
  var isOverdue = status === 'overdue';
  var cardClass = 'rounded-2xl border border-border col-span-full overflow-hidden'
    + (isOverdue ? ' animate-pulse-overdue' : '');

  return (
    <Card className={cardClass} data-testid="hero-task-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-widest">
              Next Up
            </span>
            {isShared ? (
              <Badge variant="outline" className="rounded-full text-[10px] font-heading border-blue-400 text-blue-600 dark:text-blue-400 gap-0.5" data-testid="hero-shared-badge">
                <Users className="w-3 h-3" /> Shared
              </Badge>
            ) : null}
          </div>
          <Badge className={'rounded-full text-xs font-heading ' + getStatusColor(status)} data-testid="hero-task-status">
            {status}
          </Badge>
        </div>
        <CardTitle className="font-heading text-2xl md:text-3xl font-bold mt-1" data-testid="hero-task-title">
          {title}
        </CardTitle>
        {isShared && ownerName ? (
          <p className="text-sm text-muted-foreground font-body mt-0.5">Shared by {ownerName}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        {description ? (
          <p className="text-muted-foreground font-body mb-3">{description}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
            <span className="font-body">{getDueText(nextDue)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Repeat className="w-4 h-4" />
            <span className="font-body">Every {intervalDays} day{intervalDays !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <HeroTagList items={tags} />
        <Button
          onClick={onComplete}
          className="rounded-full font-heading font-bold px-8 shadow-lg hover:shadow-xl transition-all duration-300"
          data-testid="hero-complete-btn"
        >
          Mark Complete <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  var authCtx = useAuth();
  var user = authCtx.user;
  var navigate = useNavigate();
  var tasksState = useState([]);
  var tasks = tasksState[0];
  var setTasks = tasksState[1];
  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var fetchTasks = useCallback(async function() {
    try {
      var res// = await api.get('/tasks');
      setTasks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function() {
    fetchTasks();
  }, [fetchTasks]);

  var overdueCount = 0;
  var completedTotal = 0;
  var upcomingCount = 0;
  var sharedCount = 0;
  for (var i = 0; i < tasks.length; i++) {
    completedTotal += tasks[i].completion_count;
    if (tasks[i].is_shared) sharedCount++;
    if (isPast(new Date(tasks[i].next_due))) {
      overdueCount++;
    } else {
      upcomingCount++;
    }
  }

  var firstName = user ? user.name.split(' ')[0] : 'there';
  var overdueMsg = overdueCount > 0
    ? 'You have ' + overdueCount + ' overdue task' + (overdueCount > 1 ? 's' : '')
    : 'All caught up! Great rhythm.';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="dashboard-loading">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  var nextTask = tasks.length > 0 ? tasks[0] : null;
  var restTasks = tasks.length > 1 ? tasks.slice(1) : [];

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight" data-testid="dashboard-greeting">
          Hey, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1 font-body text-base md:text-lg">
          {overdueMsg}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3" data-testid="dashboard-stats">
        <StatCard
          icon={<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Repeat className="w-5 h-5 text-primary" /></div>}
          value={tasks.length}
          label="Total Tasks"
          testId="stat-total-tasks"
        />
        <StatCard
          icon={<div className="w-10 h-10 rounded-full bg-[#9F1239]/10 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-5 h-5 text-[#9F1239]" /></div>}
          value={overdueCount}
          label="Overdue"
          testId="stat-overdue"
        />
        <StatCard
          icon={<div className="w-10 h-10 rounded-full bg-status-soon/10 flex items-center justify-center flex-shrink-0"><Clock className="w-5 h-5 text-status-soon" /></div>}
          value={upcomingCount}
          label="Upcoming"
          testId="stat-upcoming"
        />
        <StatCard
          icon={<div className="w-10 h-10 rounded-full bg-status-safe/10 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-5 h-5 text-status-safe" /></div>}
          value={completedTotal}
          label="Completions"
          testId="stat-completed"
        />
        <StatCard
          icon={<div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-blue-500" /></div>}
          value={sharedCount}
          label="Shared"
          testId="stat-shared"
        />
      </div>

      {tasks.length === 0 ? (
        <Card className="rounded-2xl border border-border" data-testid="empty-dashboard">
          <CardContent className="p-8 text-center">
            <img
              src="https://images.unsplash.com/photo-1768827642561-4d06523d0324?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHwzfHxjbGVhbiUyMG9yZ2FuaXplZCUyMG1pbmltYWxpc3QlMjB3b3Jrc3BhY2UlMjBkZXNrJTIwdG9wJTIwdmlld3xlbnwwfHx8fDE3NzA1MzU4MjV8MA&ixlib=rb-4.1.0&q=85"
              alt="Empty workspace"
              className="w-48 h-48 object-cover rounded-2xl mx-auto mb-4 opacity-80"
            />
            <h3 className="font-heading text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-4 font-body">Create your first recurring task to get started.</p>
            <Button
              onClick={function() { navigate('/tasks'); }}
              className="rounded-full font-heading font-bold px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="create-first-task-btn"
            >
              Create Your First Task
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {nextTask ? (
        <HeroCard
          title={nextTask.title}
          description={nextTask.description}
          nextDue={nextTask.next_due}
          intervalDays={nextTask.interval_days}
          tags={nextTask.tags}
          isShared={nextTask.is_shared}
          ownerName={nextTask.owner_name}
          onComplete={function() { navigate('/complete'); }}
        />
      ) : null}

      {restTasks.length > 0 ? (
        <div>
          <h2 className="font-heading text-lg md:text-xl font-semibold mb-4" data-testid="upcoming-heading">
            All Tasks
          </h2>
          <div className="space-y-3" data-testid="task-list">
            {restTasks.map(function(task) {
              return (
                <div key={task.id} className="animate-slide-up">
                  <TaskRow
                    taskId={task.id}
                    title={task.title}
                    nextDue={task.next_due}
                    intervalDays={task.interval_days}
                    tags={task.tags}
                    isShared={task.is_shared}
                    ownerName={task.owner_name}
                    onClick={function() { navigate('/complete'); }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
