const {
  createNotification,
} = require("../v1/controller/notification.controller");

/**
 * Generate a notification for job status change
 * @param {Object} job - The job object
 * @param {string} previousStatus - The previous job status
 * @param {Object} user - The user object
 */
exports.notifyJobStatusChange = async (job, previousStatus, user) => {
  if (!job || !user) return;

  let title, message, priority;

  switch (job.status) {
    case "interview":
      title = "Interview Stage Reached";
      message = `Great news! Your application for ${job.position} at ${job.company} has moved to the interview stage.`;
      priority = "high";
      break;
    case "offer":
      title = "Job Offer Received";
      message = `Congratulations! You've received an offer for ${job.position} at ${job.company}.`;
      priority = "high";
      break;
    case "rejected":
      title = "Application Status Updated";
      message = `Your application for ${job.position} at ${job.company} was not successful this time.`;
      priority = "medium";
      break;
    default:
      title = "Application Status Updated";
      message = `Your application for ${job.position} at ${job.company} has been updated from ${previousStatus} to ${job.status}.`;
      priority = "medium";
  }

  await createNotification({
    userId: user._id,
    title,
    message,
    type: "job",
    priority,
    relatedItem: {
      type: "job",
      id: job._id,
    },
    actionLink: `/jobs/${job._id}`,
    sendEmail: job.status === "offer" || job.status === "interview", // Send email for important status changes
    emailTemplate: "notification",
    emailData: {
      title,
      message,
      priority,
      priorityLabel: priority.charAt(0).toUpperCase() + priority.slice(1),
    },
  });
};

/**
 * Generate a notification for upcoming interview
 * @param {Object} job - The job object
 * @param {Object} interview - The interview object
 * @param {Object} user - The user object
 * @param {number} hoursUntil - Hours until the interview
 */
exports.notifyUpcomingInterview = async (job, interview, user, hoursUntil) => {
  if (!job || !interview || !user) return;

  const interviewType = interview.interviewType || "interview";
  const formattedDate = new Date(interview.date).toLocaleString();

  const title = `Upcoming ${interviewType} Interview`;
  const message = `You have an ${interviewType} interview for ${job.position} at ${job.company} in ${hoursUntil} hours (${formattedDate}).`;

  await createNotification({
    userId: user._id,
    title,
    message,
    type: "job",
    priority: "high",
    relatedItem: {
      type: "job",
      id: job._id,
    },
    actionLink: `/jobs/${job._id}`,
    sendEmail: true,
    emailTemplate: "notification",
    emailData: {
      title,
      message,
      priority: "high",
      priorityLabel: "High",
    },
  });
};

/**
 * Generate a notification for upcoming task
 * @param {Object} task - The task object
 * @param {Object} user - The user object
 * @param {number} hoursUntil - Hours until the task is due
 */
exports.notifyUpcomingTask = async (task, user, hoursUntil) => {
  if (!task || !user) return;

  const taskType = task.category ? task.category.replace("-", " ") : "task";
  const formattedDate = new Date(task.dueDate).toLocaleString();

  const title = `Upcoming ${taskType} Task Due Soon`;
  const message = `Your task "${task.title}" is due in ${hoursUntil} hours (${formattedDate}).`;

  await createNotification({
    userId: user._id,
    title,
    message,
    type: "task",
    priority: task.priority,
    relatedItem: {
      type: "task",
      id: task._id,
    },
    actionLink: `/tasks/${task._id}`,
    sendEmail: task.priority === "high",
    emailTemplate: "notification",
    emailData: {
      title,
      message,
      priority: task.priority,
      priorityLabel:
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
    },
  });
};

/**
 * Generate a notification for task completion needed
 * @param {Object} task - The task object
 * @param {Object} user - The user object
 */
exports.notifyTaskOverdue = async (task, user) => {
  if (!task || !user) return;

  const taskType = task.category ? task.category.replace("-", " ") : "task";
  const formattedDate = new Date(task.dueDate).toLocaleString();

  const title = `Overdue ${taskType} Task`;
  const message = `Your task "${task.title}" was due on ${formattedDate} and is now overdue.`;

  await createNotification({
    userId: user._id,
    title,
    message,
    type: "task",
    priority: "high",
    relatedItem: {
      type: "task",
      id: task._id,
    },
    actionLink: `/tasks/${task._id}`,
    sendEmail: true,
    emailTemplate: "notification",
    emailData: {
      title,
      message,
      priority: "high",
      priorityLabel: "High",
    },
  });
};

/**
 * Generate a notification for payment success
 * @param {Object} transaction - The transaction object
 * @param {Object} plan - The plan object
 * @param {Object} user - The user object
 */
exports.notifyPaymentSuccess = async (transaction, plan, user) => {
  if (!transaction || !plan || !user) return;

  const title = "Payment Successful";
  const message = `Your payment for the ${plan.name} plan has been successfully processed. Your subscription is now active.`;

  await createNotification({
    userId: user._id,
    title,
    message,
    type: "payment",
    priority: "medium",
    relatedItem: {
      type: "payment",
      id: transaction._id,
    },
    actionLink: `/account/billing`,
    sendEmail: false, // Already sending a dedicated email for payments
  });
};

/**
 * Generate a notification for subscription expiring soon
 * @param {Object} transaction - The transaction object
 * @param {Object} plan - The plan object
 * @param {Object} user - The user object
 * @param {number} daysLeft - Days until expiration
 */
exports.notifySubscriptionExpiring = async (
  transaction,
  plan,
  user,
  daysLeft
) => {
  if (!transaction || !plan || !user) return;

  const title = "Subscription Expiring Soon";
  const message = `Your ${plan.name} plan subscription will expire in ${daysLeft} days. Please renew to maintain access to all features.`;

  await createNotification({
    userId: user._id,
    title,
    message,
    type: "payment",
    priority: "high",
    relatedItem: {
      type: "payment",
      id: transaction._id,
    },
    actionLink: `/account/billing`,
    sendEmail: true,
    emailTemplate: "notification",
    emailData: {
      title,
      message,
      priority: "high",
      priorityLabel: "High",
    },
  });
};
