import { useState, useEffect, useCallback } from 'react';
// import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, Clock, Minus, Plus, CalendarDays, Repeat, PartyPopper, Users } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';

function getTaskStatus(nextDue) {
  const due = new Date(nextDue);
  if (isPast(due)) return 'overdue';
  const hours = (due - new Date()) / 3600000;
  if (hours < 24) return 'urgent';
  if (hours / 24 <= 3) return 'soon';
  return 'safe';
}

function getStatusLabel(status) {
  if (status === 'overdue') return 'Overdue';
  if (status === 'urgent') return 'Urgent';
  if (status === 'soon') return 'Soon';
  return 'Safe';
}

function getStatusBadge(status) {
  if (status === 'overdue') return 'bg-[#9F1239] text-white';
  if (status === 'urgent') return 'bg-status-urgent text-white';
  return 'bg-status-soon text-white';
}

function getCardBorder(status) {
  if (status === 'overdue') return 'task-border-overdue animate-pulse-overdue';
  if (status === 'urgent') return 'task-border-urgent';
  return 'task-border-soon';
}

function formatDueDate(nextDue) {
  var due = new Date(nextDue);
  if (isPast(due)) return 'Overdue by ' + formatDistanceToNow(due);
  return 'Due ' + formatDistanceToNow(due, { addSuffix: true });
}

function TagList({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {items.map(function(tag) {
        return (
          <Badge key={tag} variant="secondary" className="rounded-full text-xs font-body">
            {tag}
          </Badge>
        );
      })}
    </div>
  );
}

function FeedbackButtons({ taskId, isDisabled, onComplete }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-heading font-medium text-muted-foreground">
        How was the timing?
      </p>
      <div className="grid grid-cols-3 gap-2" data-testid={'feedback-buttons-' + taskId}>
        <Button
          onClick={function() { onComplete(taskId, 'too_early'); }}
          disabled={isDisabled}
          className="rounded-full font-heading font-bold h-12 text-sm bg-status-safe hover:bg-status-safe/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
          data-testid={'feedback-too-early-' + taskId}
        >
          <Plus className="w-4 h-4 mr-1" />
          Too Early
        </Button>
        <Button
          onClick={function() { onComplete(taskId, 'just_right'); }}
          disabled={isDisabled}
          className="rounded-full font-heading font-bold h-12 text-sm bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
          data-testid={'feedback-just-right-' + taskId}
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Just Right
        </Button>
        <Button
          onClick={function() { onComplete(taskId, 'too_late'); }}
          disabled={isDisabled}
          className="rounded-full font-heading font-bold h-12 text-sm bg-status-urgent hover:bg-status-urgent/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
          data-testid={'feedback-too-late-' + taskId}
        >
          <Minus className="w-4 h-4 mr-1" />
          Too Late
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center font-body mt-1">
        Too Early = longer interval · Too Late = shorter interval
      </p>
    </div>
  );
}

function DueTaskCard({ taskId, title, description, nextDue, intervalDays, tags, isShared, ownerName, isCompleting, onComplete }) {
  var status = getTaskStatus(nextDue);
  var borderClass = 'rounded-2xl border border-border ' + getCardBorder(status);
  var badgeClass = 'rounded-full text-xs font-heading shrink-0 ' + getStatusBadge(status);

  return (
    <Card className={borderClass} data-testid={'complete-task-' + taskId}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-heading text-lg font-bold" data-testid={'complete-task-title-' + taskId}>
              {title}
            </CardTitle>
            {isShared ? (
              <Badge variant="outline" className="rounded-full text-[10px] font-heading border-blue-400 text-blue-600 dark:text-blue-400 gap-0.5 w-fit mt-1" data-testid={'complete-shared-' + taskId}>
                <Users className="w-3 h-3" /> Shared{ownerName ? ' by ' + ownerName : ''}
              </Badge>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground font-body mt-1">{description}</p>
            ) : null}
          </div>
          <Badge className={badgeClass} data-testid={'complete-task-status-' + taskId}>
            {getStatusLabel(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="font-body">{formatDueDate(nextDue)}</span>
          </span>
          <span className="flex items-center gap-1">
            <Repeat className="w-3.5 h-3.5" />
            <span className="font-body">Every {intervalDays}d</span>
          </span>
        </div>
        <TagList items={tags} />
        <FeedbackButtons taskId={taskId} isDisabled={isCompleting} onComplete={onComplete} />
      </CardContent>
    </Card>
  );
}

function SafeTaskItem({ taskId, title, nextDue, intervalDays, isShared, ownerName, isCompleting, onComplete }) {
  return (
    <Card className="rounded-2xl border border-border task-border-safe" data-testid={'safe-task-' + taskId}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-semibold text-base">{title}</h3>
              {isShared ? (
                <Badge variant="outline" className="rounded-full text-[10px] font-heading border-blue-400 text-blue-600 dark:text-blue-400 gap-0.5" data-testid={'safe-shared-' + taskId}>
                  <Users className="w-3 h-3" /> Shared
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground font-body">
              Due {formatDistanceToNow(new Date(nextDue), { addSuffix: true })} · Every {intervalDays}d
              {isShared && ownerName ? ' · by ' + ownerName : ''}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={function() { onComplete(taskId, 'just_right'); }}
            disabled={isCompleting}
            className="rounded-full font-heading shrink-0"
            data-testid={'complete-early-' + taskId}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CompletePage() {
  var tasksState = useState([]);
  var tasks = tasksState[0];
  var setTasks = tasksState[1];
  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var completingState = useState(null);
  var completing = completingState[0];
  var setCompleting = completingState[1];

  var fetchTasks = useCallback(async function() {
    try {
      // var res = await api.get('/tasks');
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

  var handleComplete = async function(taskId, feedback) {
    setCompleting(taskId);
    try {
      // var res = await api.post('/tasks/' + taskId + '/complete', { feedback: feedback });
      var task = tasks.find(function(t) { return t.id === taskId; });
      var labels = { too_early: 'Too early', just_right: 'Just right', too_late: 'Too late' };
      var taskTitle = task ? task.title : 'Task';
      toast.success(taskTitle + ' completed! Next in ' + res.data.interval_days + ' days (' + labels[feedback] + ')');
      fetchTasks();
    } catch (e) {
      toast.error('Failed to complete task');
    } finally {
      setCompleting(null);
    }
  };

  var dueTasks = [];
  var safeTasks = [];
  for (var i = 0; i < tasks.length; i++) {
    var s = getTaskStatus(tasks[i].next_due);
    if (s === 'overdue' || s === 'urgent' || s === 'soon') {
      dueTasks.push(tasks[i]);
    } else {
      safeTasks.push(tasks[i]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="complete-loading">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="complete-page">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight" data-testid="complete-heading">
          Complete Tasks
        </h1>
        <p className="text-muted-foreground mt-1 font-body text-base">
          Mark tasks as done and adjust their rhythm
        </p>
      </div>

      {tasks.length === 0 ? (
        <Card className="rounded-2xl border border-border" data-testid="no-tasks-to-complete">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground font-body">Create tasks first, then come back to complete them.</p>
          </CardContent>
        </Card>
      ) : null}

      {tasks.length > 0 && dueTasks.length === 0 ? (
        <Card className="rounded-2xl border border-border" data-testid="all-caught-up">
          <CardContent className="p-8 text-center">
            <PartyPopper className="w-12 h-12 text-status-safe mx-auto mb-3" />
            <h3 className="font-heading text-xl font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground font-body">No tasks due right now. Enjoy your free time.</p>
          </CardContent>
        </Card>
      ) : null}

      {dueTasks.length > 0 ? (
        <div>
          <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2" data-testid="due-tasks-heading">
            <Clock className="w-5 h-5 text-status-soon" />
            Due Now ({dueTasks.length})
          </h2>
          <div className="space-y-4" data-testid="due-tasks-list">
            {dueTasks.map(function(task) {
              return (
                <DueTaskCard
                  key={task.id}
                  taskId={task.id}
                  title={task.title}
                  description={task.description}
                  nextDue={task.next_due}
                  intervalDays={task.interval_days}
                  tags={task.tags}
                  isShared={task.is_shared}
                  ownerName={task.owner_name}
                  isCompleting={completing === task.id}
                  onComplete={handleComplete}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {safeTasks.length > 0 ? (
        <div>
          <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2" data-testid="safe-tasks-heading">
            <CheckCircle2 className="w-5 h-5 text-status-safe" />
            Not Due Yet ({safeTasks.length})
          </h2>
          <div className="space-y-3" data-testid="safe-tasks-list">
            {safeTasks.map(function(task) {
              return (
                <SafeTaskItem
                  key={task.id}
                  taskId={task.id}
                  title={task.title}
                  nextDue={task.next_due}
                  intervalDays={task.interval_days}
                  isShared={task.is_shared}
                  ownerName={task.owner_name}
                  isCompleting={completing === task.id}
                  onComplete={handleComplete}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
