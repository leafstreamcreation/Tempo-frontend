import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Plus, MoreVertical, Pencil, Trash2, Loader2, Repeat, Tag, X, CalendarDays, Users, Share2, Lock
} from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';

function getStatusBorder(nextDue) {
  var due = new Date(nextDue);
  if (isPast(due)) return 'task-border-overdue';
  var hours = (due - new Date()) / 3600000;
  if (hours < 24) return 'task-border-urgent';
  if (hours / 24 <= 3) return 'task-border-soon';
  return 'task-border-safe';
}

var TAG_COLORS = [
  '#F97316', '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E', '#6366F1'
];

function TaskTagList({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
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

function TaskItem({ taskId, title, description, intervalDays, nextDue, completionCount, tags, isShared, isOneTime, ownerName, onEdit, onDelete, onToggleShared }) {
  var border = getStatusBorder(nextDue);
  var isOverdue = isPast(new Date(nextDue));
  var dueText = isOverdue
    ? 'Overdue by ' + formatDistanceToNow(new Date(nextDue))
    : 'Due ' + formatDistanceToNow(new Date(nextDue), { addSuffix: true });

  return (
    <Card
      className={'rounded-2xl border border-border ' + border + ' hover:shadow-md transition-all duration-300'}
      data-testid={'task-item-' + taskId}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-heading font-semibold text-base" data-testid={'task-title-' + taskId}>
                {title}
              </h3>
              {isShared ? (
                <Badge variant="outline" className="rounded-full text-[10px] font-heading border-blue-400 text-blue-600 dark:text-blue-400 gap-0.5" data-testid={'shared-indicator-' + taskId}>
                  <Users className="w-3 h-3" /> Shared
                </Badge>
              ) : null}
              {isOneTime ? (
                <Badge variant="outline" className="rounded-full text-[10px] font-heading border-blue-400 text-blue-600 dark:text-blue-400 gap-0.5" data-testid={'one-time-indicator-' + taskId}>
                  <Users className="w-3 h-3" /> One-time
                </Badge>
              ) : null}
            </div>
            {description ? (
              <p className="text-sm text-muted-foreground font-body mb-2 line-clamp-2">
                {description}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5" />
                <span className="font-body">Every {intervalDays}d</span>
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="font-body">{dueText}</span>
              </span>
              {completionCount > 0 ? (
                <span className="font-body">Done {completionCount}x</span>
              ) : null}
              {isShared && ownerName ? (
                <span className="font-body">by {ownerName}</span>
              ) : null}
            </div>
            <TaskTagList items={tags} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full shrink-0"
                data-testid={'task-menu-' + taskId}
                aria-label="Task options"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem
                onClick={onEdit}
                className="cursor-pointer"
                data-testid={'edit-task-' + taskId}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onToggleShared}
                className="cursor-pointer"
                data-testid={'toggle-shared-' + taskId}
              >
                {isShared ? (
                  <><Lock className="w-4 h-4 mr-2" /> Make Personal</>
                ) : (
                  <><Share2 className="w-4 h-4 mr-2" /> Make Shared</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="cursor-pointer text-destructive focus:text-destructive"
                data-testid={'delete-task-' + taskId}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function TagBadgeList({ tags, selectedTags, onSelectTag }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2" data-testid="tags-list">
      {tags.map(function(tag) {
        return (
          <Badge
            key={tag.id}
            variant={selectedTags.includes(tag.id) ? 'default' : 'secondary'}
            className="rounded-full font-body text-xs flex items-center gap-1 px-2"
            style={{ borderColor: tag.color, borderWidth: '1px' }}
            data-testid={'tag-badge-' + tag.name}onClick={function() { onSelectTag(tag.id); }}
          >
            <span className="w-2 h-2 rounded-full mr-0.5" style={{ backgroundColor: tag.color }} />
            {tag.name}
          </Badge>
        );
      })}
    </div>
  );
}

function TagSelector({ tags, selectedTags, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(function(tag) {
        var isSelected = selectedTags.indexOf(tag.name) >= 0;
        var btnClass = isSelected
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-secondary text-secondary-foreground border-border hover:border-primary/50';
        return (
          <button
            key={tag.id}
            type="button"
            onClick={function() { onToggle(tag.name); }}
            className={'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border ' + btnClass}
            data-testid={'toggle-tag-' + tag.name}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? '#fff' : tag.color }} />
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}

export default function TasksPage() {
  var tasksState = useState([]);
  var tasks = tasksState[0];
  var setTasks = tasksState[1];
  var tagsState = useState([]);
  var tags = tagsState[0];
  var setTags = tagsState[1];
  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var dialogState = useState(false);
  var dialogOpen = dialogState[0];
  var setDialogOpen = dialogState[1];
  var deleteDialogState = useState(false);
  var deleteDialogOpen = deleteDialogState[0];
  var setDeleteDialogOpen = deleteDialogState[1];
  var editingState = useState(null);
  var editingTask = editingState[0];
  var setEditingTask = editingState[1];
  var deletingState = useState(null);
  var deletingTask = deletingState[0];
  var setDeletingTask = deletingState[1];
  var savingState = useState(false);
  var saving = savingState[0];
  var setSaving = savingState[1];
  var newTagState = useState('');
  var newTagName = newTagState[0];
  var setNewTagName = newTagState[1];
  var formState = useState({ title: '', description: '', interval_days: 7, tags: [], is_shared: false });
  var form = formState[0];
  var setForm = formState[1];
  var selectedTagsState = useState([]);
  var selectedTags = selectedTagsState[0];
  var setSelectedTags = selectedTagsState[1];
  var filteredTasks = useMemo(function() {
    if (selectedTags.length === 0) return tasks;
    const tagDict = {};
    tags.forEach(function(tag) {
      tagDict[tag.id] = tag.name;
    });
    return tasks.filter(function(task) {
      for(var id of selectedTags) {
        for(var name of task.tags) {
          if (name === tagDict[id]) {
            return true;
          }
        }
      }
      return false;
    });
  }, [tasks, selectedTags]);

  var fetchData = useCallback(async function() {
    try {
      var results = await Promise.all([
        api.get('/tasks'), 
        api.get('/tags')
      ]);
      setTasks(results[0].data);
      setTags(results[1].data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function() { fetchData(); }, [fetchData]);

  var openCreate = function() {
    setEditingTask(null);
    setForm({ title: '', description: '', interval_days: 7, tags: [], is_shared: false, non_recurring: false });
    setDialogOpen(true);
  };

  var openEdit = function(task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      interval_days: task.interval_days,
      tags: task.tags,
    });
    setDialogOpen(true);
  };

  var handleSave = async function(e) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      if (editingTask) {
        await api.put('/tasks/' + editingTask.id, { title: form.title, description: form.description, interval_days: form.interval_days, tags: form.tags });
        toast.success('Task updated');
      } else {
        await api.post('/tasks', form);
        toast.success('Task created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  var handleToggleShared = async function(taskId) {
    try {
      var res = await api.post('/tasks/' + taskId + '/toggle-shared');
      var newStatus = res.data.is_shared;
      toast.success(newStatus ? 'Task is now shared with everyone' : 'Task is now personal');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to toggle sharing');
    }
  };

  var handleDelete = async function() {
    if (!deletingTask) return;
    try {
      await api.delete('/tasks/' + deletingTask.id);
      toast.success('Task deleted');
      setDeleteDialogOpen(false);
      setDeletingTask(null);
      fetchData();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  var toggleTag = function(tagName) {
    setForm(function(prev) {
      var idx = prev.tags.indexOf(tagName);
      var newTags = idx >= 0
        ? prev.tags.filter(function(t) { return t !== tagName; })
        : prev.tags.concat([tagName]);
      return { title: prev.title, description: prev.description, interval_days: prev.interval_days, tags: newTags, is_shared: prev.is_shared };
    });
  };

  var createTag = async function() {
    if (!newTagName.trim()) return;
    try {
      var color = TAG_COLORS[tags.length % TAG_COLORS.length];
      await api.post('/tags', { name: newTagName.trim(), color: color });
      setNewTagName('');
       var res = await api.get('/tags');
      setTags(res.data);
      toast.success('Tag created');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create tag');
    }
  };

  var selectTag = async function(tagId) {
    setSelectedTags(function(prev) {
      var idx = prev.indexOf(tagId);
      return idx >= 0
        ? prev.filter(function(t) { return t !== tagId; })
        : prev.concat([tagId]);
    });
    // try {
    //   await api.delete('/tags/' + tagId);
    //   var res = await api.get('/tags');
    //   setTags(res.data);
    //   toast.success('Tag deleted');
    // } catch (e) {
    //   toast.error('Failed to delete tag');
    // }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="tasks-loading">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  var taskCountLabel = tasks.length + ' recurring task' + (tasks.length !== 1 ? 's' : '');
  var personalCount = 0;
  var sharedCount = 0;
  for (var ci = 0; ci < tasks.length; ci++) {
    if (tasks[ci].is_shared) { sharedCount++; } else { personalCount++; }
  }

  return (
    <div className="space-y-6" data-testid="tasks-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight" data-testid="tasks-heading">
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1 font-body text-base">{personalCount} personal · {sharedCount} shared</p>
        </div>
        <Button
          onClick={openCreate}
          className="rounded-full font-heading font-bold px-6 shadow-lg hover:shadow-xl transition-all duration-300"
          data-testid="create-task-button"
        >
          <Plus className="w-4 h-4 mr-1" /> New Task
        </Button>
      </div>

      <TagBadgeList tags={tags} selectedTags={selectedTags} onSelectTag={selectTag} />

      {tasks.length === 0 ? (
        <Card className="rounded-2xl border border-border" data-testid="empty-tasks">
          <CardContent className="p-8 text-center">
            <Repeat className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground font-body mb-4">Click "New Task" to create your first recurring task.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3" data-testid="tasks-list">
          {filteredTasks.map(function(task) {
            return (
              <div key={task.id} className="animate-slide-up">
                <TaskItem
                  taskId={task.id}
                  title={task.title}
                  description={task.description}
                  intervalDays={task.interval_days}
                  nextDue={task.next_due}
                  completionCount={task.completion_count}
                  tags={task.tags}
                  isShared={task.is_shared}
                  isOneTime={task.non_recurring}
                  ownerName={task.owner_name}
                  onEdit={function() { openEdit(task); }}
                  onDelete={function() { setDeletingTask(task); setDeleteDialogOpen(true); }}
                  onToggleShared={function() { handleToggleShared(task.id); }}
                />
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-md mx-4" data-testid="task-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl" data-testid="task-dialog-title">
              {editingTask ? 'Edit Task' : 'New Task'}
            </DialogTitle>
            <DialogDescription className="font-body">
              {editingTask ? 'Update your recurring task details.' : 'Set up a new task.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-heading text-sm font-medium">Title</Label>
              <Input
                value={form.title}
                onChange={function(e) { setForm({ title: e.target.value, description: form.description, interval_days: form.interval_days, tags: form.tags, is_shared: form.is_shared, non_recurring: form.non_recurring }); }}
                placeholder="e.g., Clean kitchen"
                className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200"
                data-testid="task-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-heading text-sm font-medium">Description (optional)</Label>
              <Input
                value={form.description}
                onChange={function(e) { setForm({ title: form.title, description: e.target.value, interval_days: form.interval_days, tags: form.tags, is_shared: form.is_shared, non_recurring: form.non_recurring }); }}
                placeholder="Any extra details..."
                className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200"
                data-testid="task-description-input"
              />
            </div>
            { !form.non_recurring ? <div className="space-y-2">
                <Label className="font-heading text-sm font-medium">Repeat every (days)</Label>
                <Input
                  type="number"
                  min="1"
                  step="0.5"
                  value={form.interval_days}
                  onChange={function(e) { setForm({ title: form.title, description: form.description, interval_days: parseFloat(e.target.value) || 1, tags: form.tags, is_shared: form.is_shared, non_recurring: form.non_recurring }); }}
                  className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200"
                  data-testid="task-interval-input"
                />
              </div> : null
            }
            {!editingTask ? (
              <div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary" data-testid="shared-toggle-section">
                  <div className="flex-1">
                    <p className="text-sm font-heading font-medium flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" /> Shared Task
                    </p>
                    <p className="text-xs text-muted-foreground font-body">Visible and manageable by all users</p>
                  </div>
                  <button
                    type="button"
                    onClick={function() { setForm({ title: form.title, description: form.description, interval_days: form.interval_days, tags: form.tags, is_shared: !form.is_shared, non_recurring: form.non_recurring }); }}
                    className={'relative w-11 h-6 rounded-full transition-colors duration-200 ' + (form.is_shared ? 'bg-blue-500' : 'bg-muted-foreground/30')}
                    data-testid="shared-toggle"
                    aria-label="Toggle shared"
                  >
                    <span className={'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ' + (form.is_shared ? 'translate-x-5' : 'translate-x-0')} />
                  </button>
                </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary" data-testid="non-recurring-toggle-section">
                    <div className="flex-1">
                      <p className="text-sm font-heading font-medium flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-500" /> One-Time Task
                      </p>
                      <p className="text-xs text-muted-foreground font-body">Will disappear after completion</p>
                    </div>
                    <button
                      type="button"
                      onClick={function() { setForm({ title: form.title, description: form.description, interval_days: form.non_recurring ? 0 : form.interval_days, tags: form.tags, is_shared: form.is_shared, non_recurring: !form.non_recurring }); }}
                      className={'relative w-11 h-6 rounded-full transition-colors duration-200 ' + (form.non_recurring ? 'bg-blue-500' : 'bg-muted-foreground/30')}
                      data-testid="non-recurring-toggle"
                      aria-label="Toggle non-recurring"
                    >
                      <span className={'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ' + (form.non_recurring ? 'translate-x-5' : 'translate-x-0')} />
                    </button>
                  </div>
                </div>
            ) : null}
            <div className="space-y-2">
              <Label className="font-heading text-sm font-medium flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags
              </Label>
              <TagSelector tags={tags} selectedTags={form.tags} onToggle={toggleTag} />
              <div className="flex gap-2">
                <Input
                  value={newTagName}
                  onChange={function(e) { setNewTagName(e.target.value); }}
                  placeholder="New tag name..."
                  className="rounded-xl border-2 border-transparent bg-secondary focus:bg-background focus:border-primary transition-all duration-200 text-sm h-8"
                  onKeyDown={function(e) { if (e.key === 'Enter') { e.preventDefault(); createTag(); } }}
                  data-testid="new-tag-input"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={createTag}
                  className="rounded-full font-heading shrink-0"
                  data-testid="create-tag-button"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={saving}
                className="w-full rounded-full font-heading font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="save-task-button"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl max-w-sm mx-4" data-testid="delete-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">Delete Task?</DialogTitle>
            <DialogDescription className="font-body">
              This will permanently delete this task. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={function() { setDeleteDialogOpen(false); }}
              className="rounded-full font-heading"
              data-testid="cancel-delete-button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-full font-heading"
              data-testid="confirm-delete-button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
