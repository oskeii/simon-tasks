from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Task

@receiver(post_delete, sender=Task)
def reassign_subtasks_to_parent(sender, instance, **kwargs):
    """
    Reassign sub-tasks of a deleted parent task (Task A) to its parent task (Task B).
    If no parent task exists, set sub-tasks' parent to NULL. If no sub-tasks exist, no action is taken.
    """

    if instance.sub_tasks.exists():
        parent_task = instance.parent_task

        if parent_task:
            for subtask in instance.sub_tasks.all():
                subtask.parent_task = parent_task
                subtask.save()
            print(f"Transferred {instance.sub_tasks.count()} sub-tasks to parent task {parent_task.title}")
        
        else: 
            for subtask in instance.sub_tasks.all():
                subtask.parent_task = None
                subtask.save()
            print(f"Sub-tasks of {instance.title} have been disassociated.")

    else:
        print(f"No sub-tasks to reassign for task: {instance.title}")
