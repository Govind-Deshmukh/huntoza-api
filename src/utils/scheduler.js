const Job = require("../models/Job");
const Task = require("../models/Task");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Plan = require("../models/Plan");
const notificationHelpers = require("./notificationHelpers");

/**
 * Check for upcoming interviews and send notifications
 * Runs once per hour
 */
exports.checkUpcomingInterviews = async () => {
  try {
    console.log("Running scheduled job: checkUpcomingInterviews");
    const now = new Date();

    // Set time ranges for notifications: 24 hours and 2 hours before
    const twentyFourHoursLater = new Date(now);
    twentyFourHoursLater.setHours(now.getHours() + 24);

    const twoHoursLater = new Date(now);
    twoHoursLater.setHours(now.getHours() + 2);

    // Find jobs with interviews in the next 24 hours
    const jobs = await Job.find({
      "interviewHistory.date": {
        $gte: now,
        $lte: twentyFourHoursLater,
      },
    });

    // Process each job
    for (const job of jobs) {
      const user = await User.findById(job.user);
      if (!user) continue;

      // Check each interview
      for (const interview of job.interviewHistory) {
        const interviewTime = new Date(interview.date);

        // Skip past interviews
        if (interviewTime < now) continue;

        // Calculate hours until interview
        const hoursUntil = Math.round((interviewTime - now) / (1000 * 60 * 60));

        // Notify at 24 hours and 2 hours before
        if (
          (interviewTime <= twentyFourHoursLater && hoursUntil === 24) ||
          (interviewTime <= twoHoursLater && hoursUntil === 2)
        ) {
          await notificationHelpers.notifyUpcomingInterview(
            job,
            interview,
            user,
            hoursUntil
          );
        }
      }
    }
  } catch (error) {
    console.error("Error in checkUpcomingInterviews:", error);
  }
};

/**
 * Check for tasks due soon or overdue and send notifications
 * Runs once per hour
 */
exports.checkTasks = async () => {
  try {
    console.log("Running scheduled job: checkTasks");
    const now = new Date();

    // Set time ranges for notifications
    const twentyFourHoursLater = new Date(now);
    twentyFourHoursLater.setHours(now.getHours() + 24);

    // Find tasks due in the next 24 hours that aren't completed
    const upcomingTasks = await Task.find({
      status: { $ne: "completed" },
      dueDate: {
        $gte: now,
        $lte: twentyFourHoursLater,
      },
    });

    // Find overdue tasks that haven't been notified yet
    const overdueTasks = await Task.find({
      status: { $ne: "completed" },
      dueDate: { $lt: now },
    });

    // Process upcoming tasks
    for (const task of upcomingTasks) {
      const user = await User.findById(task.user);
      if (!user) continue;

      const taskTime = new Date(task.dueDate);
      const hoursUntil = Math.round((taskTime - now) / (1000 * 60 * 60));

      // Notify at 24 hours before due date
      if (hoursUntil <= 24) {
        await notificationHelpers.notifyUpcomingTask(task, user, hoursUntil);
      }
    }

    // Process overdue tasks
    for (const task of overdueTasks) {
      const user = await User.findById(task.user);
      if (!user) continue;

      await notificationHelpers.notifyTaskOverdue(task, user);
    }
  } catch (error) {
    console.error("Error in checkTasks:", error);
  }
};

/**
 * Check for expiring subscriptions and send notifications
 * Runs once per day
 */
exports.checkExpiringSubscriptions = async () => {
  try {
    console.log("Running scheduled job: checkExpiringSubscriptions");
    const now = new Date();

    // Set time ranges for notifications: 7 days and 1 day before expiration
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);

    const oneDayLater = new Date(now);
    oneDayLater.setDate(now.getDate() + 1);

    // Find active transactions with paid plans that are expiring soon
    const transactions = await Transaction.find({
      status: "completed",
      endDate: {
        $gte: now,
        $lte: sevenDaysLater,
      },
    }).sort({ endDate: 1 }); // Sort by soonest expiring first

    // Group by user and get only the latest transaction per user
    const latestTransactionByUser = {};

    for (const transaction of transactions) {
      const userId = transaction.user.toString();

      // If we haven't seen this user yet, or this transaction is newer, keep it
      if (
        !latestTransactionByUser[userId] ||
        transaction.endDate > latestTransactionByUser[userId].endDate
      ) {
        latestTransactionByUser[userId] = transaction;
      }
    }

    // Process each user's latest transaction
    for (const userId in latestTransactionByUser) {
      const transaction = latestTransactionByUser[userId];
      const user = await User.findById(userId);
      const plan = await Plan.findById(transaction.plan);

      if (!user || !plan || plan.name === "free") continue;

      const expiryDate = new Date(transaction.endDate);
      const daysLeft = Math.round((expiryDate - now) / (1000 * 60 * 60 * 24));

      // Notify at 7 days and 1 day before expiration
      if (daysLeft === 7 || daysLeft === 1) {
        await notificationHelpers.notifySubscriptionExpiring(
          transaction,
          plan,
          user,
          daysLeft
        );
      }
    }
  } catch (error) {
    console.error("Error in checkExpiringSubscriptions:", error);
  }
};

/**
 * Initialize all schedulers
 * Should be called when the server starts
 */
exports.initSchedulers = () => {
  // Run interview check every hour
  setInterval(this.checkUpcomingInterviews, 60 * 60 * 1000);

  // Run task check every hour
  setInterval(this.checkTasks, 60 * 60 * 1000);

  // Run subscription check once per day
  setInterval(this.checkExpiringSubscriptions, 24 * 60 * 60 * 1000);

  // Run immediately on startup
  this.checkUpcomingInterviews();
  this.checkTasks();
  this.checkExpiringSubscriptions();

  console.log("All schedulers initialized");
};
