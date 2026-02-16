import emailjs from '@emailjs/browser';

// Initialize EmailJS (you'll get these from EmailJS dashboard)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

// Template IDs for different email types
const TEMPLATE_IDS = {
  TASK_ASSIGNMENT: import.meta.env.VITE_EMAILJS_TEMPLATE_TASK_ASSIGNMENT || 'task_assignment',
  STATUS_CHANGE: import.meta.env.VITE_EMAILJS_TEMPLATE_STATUS_CHANGE || 'status_change',
};

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

/**
 * Send email when task is created and assigned to a user
 */
export const sendTaskAssignmentEmail = async (task, assignedUserEmail) => {
  if (!assignedUserEmail || !assignedUserEmail.trim()) {
    return { success: false, error: 'No assigned user email' };
  }

  try {
    const templateParams = {
      to_email: assignedUserEmail,
      task_headline: task.headline,
      task_description: task.description || 'No description',
      task_priority: task.priority,
      task_deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline',
      task_status: task.status || 'To Do',
      created_by: task.createdBy,
      task_url: 'https://urc-it.netlify.app',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_IDS.TASK_ASSIGNMENT,
      templateParams
    );

    return { success: true, response };
  } catch (error) {
    console.error('Error sending task assignment email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email when task status is changed
 */
export const sendStatusChangeEmail = async (task, newStatus, changedByEmail) => {
  // Send to creator if status changed by assigned user
  if (task.createdBy && task.createdBy !== changedByEmail) {
    try {
      const templateParams = {
        to_email: task.createdBy,
        task_headline: task.headline,
        old_status: task.status,
        new_status: newStatus,
        changed_by: changedByEmail,
        task_url: window.location.origin + '/dashboard',
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        TEMPLATE_IDS.STATUS_CHANGE,
        templateParams
      );

      return { success: true, response };
    } catch (error) {
      console.error('Error sending status change email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send to assigned user if status changed by creator
  if (task.assignedTo && task.assignedTo !== changedByEmail && task.assignedTo !== task.createdBy) {
    try {
      const templateParams = {
        to_email: task.assignedTo,
        task_headline: task.headline,
        old_status: task.status,
        new_status: newStatus,
        changed_by: changedByEmail,
        task_url: window.location.origin + '/dashboard',
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        TEMPLATE_IDS.STATUS_CHANGE,
        templateParams
      );

      return { success: true, response };
    } catch (error) {
      console.error('Error sending status change email:', error);
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: 'No recipient found' };
};
