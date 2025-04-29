const Job = require("../../models/Job");
const Task = require("../../models/Task");
const Contact = require("../../models/Contact");
const User = require("../../models/User");
const Analytics = require("../../models/Analytics");
const mongoose = require("mongoose");

// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get counts for all job statuses
    const applicationCounts = await Job.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Format application counts
    const applicationStats = {
      total: 0,
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
      saved: 0,
    };

    applicationCounts.forEach((item) => {
      applicationStats[item._id] = item.count;
      if (item._id !== "saved") {
        applicationStats.total += item.count;
      }
    });

    // Get upcoming interviews (next 7 days)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingInterviews = await Job.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$interviewHistory" },
      {
        $match: {
          "interviewHistory.date": { $gte: today, $lte: nextWeek },
        },
      },
      { $sort: { "interviewHistory.date": 1 } },
      { $limit: 5 },
      {
        $project: {
          company: 1,
          position: 1,
          interviewDate: "$interviewHistory.date",
          interviewType: "$interviewHistory.interviewType",
          withPerson: "$interviewHistory.withPerson",
        },
      },
    ]);

    // Get pending tasks due soon
    const pendingTasks = await Task.find({
      user: userId,
      status: { $ne: "completed" },
      dueDate: { $gte: today, $lte: nextWeek },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate("relatedJob", "company position");

    // Get recent applications
    const recentApplications = await Job.find({
      user: userId,
      status: { $ne: "saved" },
    })
      .sort({ applicationDate: -1 })
      .limit(5);

    // Get application timeline data (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const applicationTimeline = await Job.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          applicationDate: { $gte: threeMonthsAgo },
          status: { $ne: "saved" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$applicationDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get activity overview
    const activityOverview = {
      totalContacts: await Contact.countDocuments({ user: userId }),
      completedTasks: await Task.countDocuments({
        user: userId,
        status: "completed",
      }),
      pendingTasks: await Task.countDocuments({
        user: userId,
        status: { $ne: "completed" },
      }),
      upcomingInterviewCount: upcomingInterviews.length,
    };

    // Prepare response
    const dashboardData = {
      applicationStats,
      upcomingInterviews,
      pendingTasks,
      recentApplications,
      applicationTimeline,
      activityOverview,
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard analytics",
      error: error.message,
    });
  }
};

// Get application analytics
exports.getApplicationAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period } = req.query;

    // Define the time period for filtering
    let startDate;
    const today = new Date();

    switch (period) {
      case "last-week":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "last-month":
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "last-3-months":
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "last-6-months":
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "last-year":
        startDate = new Date(today);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        // All time (null means no date filter)
        startDate = null;
    }

    // Build filter object
    const filter = { user: userId };
    if (startDate) {
      filter.applicationDate = { $gte: startDate };
    }

    // Status distribution
    const statusCounts = await Job.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Job type distribution
    const jobTypeCounts = await Job.aggregate([
      { $match: filter },
      { $group: { _id: "$jobType", count: { $sum: 1 } } },
    ]);

    // Application timeline (group by week or month depending on period)
    const timelineGrouping =
      period === "last-week" || period === "last-month"
        ? "%Y-%m-%d" // Daily for shorter periods
        : "%Y-%m"; // Monthly for longer periods

    const applicationTimeline = await Job.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: timelineGrouping,
              date: "$applicationDate",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top companies applied to
    const topCompanies = await Job.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$company",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Response rate (jobs that moved beyond 'applied' status)
    const totalApplications = await Job.countDocuments({
      ...filter,
      status: { $ne: "saved" },
    });

    const respondedApplications = await Job.countDocuments({
      ...filter,
      status: { $nin: ["applied", "saved"] },
    });

    const responseRate =
      totalApplications > 0
        ? Math.round((respondedApplications / totalApplications) * 100)
        : 0;

    // Prepare response
    const applicationAnalytics = {
      statusDistribution: statusCounts,
      jobTypeDistribution: jobTypeCounts,
      applicationTimeline,
      topCompanies,
      responseRate,
      totalApplications,
      respondedApplications,
    };

    res.status(200).json({
      success: true,
      data: applicationAnalytics,
    });
  } catch (error) {
    console.error("Application analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve application analytics",
      error: error.message,
    });
  }
};

// Get interview analytics
exports.getInterviewAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period } = req.query;

    // Define the time period for filtering
    let startDate;
    const today = new Date();

    switch (period) {
      case "last-month":
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "last-3-months":
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "last-6-months":
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "last-year":
        startDate = new Date(today);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        // All time (null means no date filter)
        startDate = null;
    }

    // First get all jobs with interviews for this user
    const jobsWithInterviews = await Job.find({ user: userId }).select(
      "company position interviewHistory status"
    );

    // Process the interviews
    let interviews = [];
    let interviewTypeCount = {
      phone: 0,
      video: 0,
      "in-person": 0,
      technical: 0,
      other: 0,
    };

    let interviewOutcomes = {
      pending: 0, // Job still in interview status
      success: 0, // Job moved to offer
      rejected: 0, // Job moved to rejected
      total: 0,
    };

    let interviewsByCompany = {};
    let interviewsByMonth = {};

    jobsWithInterviews.forEach((job) => {
      job.interviewHistory.forEach((interview) => {
        // Apply date filter if needed
        if (startDate && interview.date < startDate) {
          return;
        }

        interviewOutcomes.total++;

        // Count interview types
        const type = interview.interviewType;
        if (interviewTypeCount[type] !== undefined) {
          interviewTypeCount[type]++;
        } else {
          interviewTypeCount.other++;
        }

        // Count interview outcomes based on job status
        if (job.status === "interview") {
          interviewOutcomes.pending++;
        } else if (job.status === "offer") {
          interviewOutcomes.success++;
        } else if (job.status === "rejected") {
          interviewOutcomes.rejected++;
        }

        // Group by company
        if (!interviewsByCompany[job.company]) {
          interviewsByCompany[job.company] = 0;
        }
        interviewsByCompany[job.company]++;

        // Group by month
        const monthYear = new Date(interview.date).toISOString().slice(0, 7); // YYYY-MM
        if (!interviewsByMonth[monthYear]) {
          interviewsByMonth[monthYear] = 0;
        }
        interviewsByMonth[monthYear]++;

        // Add to interviews array
        interviews.push({
          company: job.company,
          position: job.position,
          date: interview.date,
          type: interview.interviewType,
          withPerson: interview.withPerson,
          jobStatus: job.status,
        });
      });
    });

    // Calculate success rate
    const successRate =
      interviewOutcomes.total > 0
        ? Math.round(
            (interviewOutcomes.success / interviewOutcomes.total) * 100
          )
        : 0;

    // Convert objects to arrays for the response
    const interviewsByCompanyArray = Object.entries(interviewsByCompany)
      .map(([company, count]) => ({
        company,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const interviewsByMonthArray = Object.entries(interviewsByMonth)
      .map(([month, count]) => ({
        month,
        count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Prepare response
    const interviewAnalytics = {
      totalInterviews: interviewOutcomes.total,
      interviewTypeDistribution: interviewTypeCount,
      interviewOutcomes,
      successRate,
      interviewsByCompany: interviewsByCompanyArray,
      interviewTimeline: interviewsByMonthArray,
      upcomingInterviews: interviews
        .filter((i) => new Date(i.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    };

    res.status(200).json({
      success: true,
      data: interviewAnalytics,
    });
  } catch (error) {
    console.error("Interview analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve interview analytics",
      error: error.message,
    });
  }
};

// Get task analytics
exports.getTaskAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period } = req.query;

    // Define the time period for filtering
    let startDate;
    const today = new Date();

    switch (period) {
      case "last-week":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "last-month":
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "last-3-months":
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      default:
        // Default to last month
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Build filter object
    const filter = { user: userId };
    if (startDate) {
      filter.createdAt = { $gte: startDate };
    }

    // Task status distribution
    const statusCounts = await Task.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Format task status counts
    const taskStatusDistribution = {
      pending: 0,
      "in-progress": 0,
      completed: 0,
      cancelled: 0,
    };

    statusCounts.forEach((item) => {
      taskStatusDistribution[item._id] = item.count;
    });

    // Task category distribution
    const categoryCounts = await Task.aggregate([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Task completion rate
    const totalTasks = await Task.countDocuments(filter);
    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "completed",
    });

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Task completion timeline
    const completionTimeline = await Task.aggregate([
      {
        $match: {
          ...filter,
          status: "completed",
          completedAt: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      user: userId,
      status: { $nin: ["completed", "cancelled"] },
      dueDate: { $lt: today },
    });

    // Average completion time (in days)
    const completionTimeData = await Task.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          status: "completed",
          completedAt: { $exists: true, $ne: null },
          createdAt: { $exists: true, $ne: null },
        },
      },
      {
        $project: {
          completionTimeHours: {
            $divide: [
              { $subtract: ["$completedAt", "$createdAt"] },
              1000 * 60 * 60, // Convert milliseconds to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgCompletionTimeHours: { $avg: "$completionTimeHours" },
        },
      },
    ]);

    const avgCompletionTimeDays =
      completionTimeData.length > 0
        ? Math.round((completionTimeData[0].avgCompletionTimeHours / 24) * 10) /
          10 // Convert to days with 1 decimal
        : 0;

    // Prepare response
    const taskAnalytics = {
      totalTasks,
      completedTasks,
      taskStatusDistribution,
      categoryDistribution: categoryCounts,
      completionRate,
      completionTimeline,
      overdueTasks,
      avgCompletionTimeDays,
    };

    res.status(200).json({
      success: true,
      data: taskAnalytics,
    });
  } catch (error) {
    console.error("Task analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve task analytics",
      error: error.message,
    });
  }
};

// Get networking analytics
exports.getNetworkingAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Contact type distribution
    const relationshipCounts = await Contact.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$relationship", count: { $sum: 1 } } },
    ]);

    // Format relationship counts
    const relationshipDistribution = {
      recruiter: 0,
      "hiring-manager": 0,
      colleague: 0,
      referral: 0,
      mentor: 0,
      other: 0,
    };

    relationshipCounts.forEach((item) => {
      relationshipDistribution[item._id] = item.count;
    });

    // Interaction method distribution (across all contacts)
    const interactionMethodCounts = await Contact.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$interactionHistory" },
      { $group: { _id: "$interactionHistory.method", count: { $sum: 1 } } },
    ]);

    // Format interaction method counts
    const interactionMethodDistribution = {
      email: 0,
      call: 0,
      meeting: 0,
      message: 0,
      other: 0,
    };

    interactionMethodCounts.forEach((item) => {
      interactionMethodDistribution[item._id] = item.count;
    });

    // Interaction timeline (by month)
    const interactionTimeline = await Contact.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$interactionHistory" },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$interactionHistory.date",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top contacts by interaction count
    const topContacts = await Contact.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          name: 1,
          company: 1,
          position: 1,
          interactionCount: { $size: "$interactionHistory" },
        },
      },
      { $sort: { interactionCount: -1 } },
      { $limit: 10 },
    ]);

    // Contacts with follow-ups due
    const followUpsDue = await Contact.find({
      user: userId,
      followUpDate: { $lte: new Date() },
    })
      .select("name company position followUpDate")
      .sort({ followUpDate: 1 });

    // Calculate total interactions
    const totalInteractions = Object.values(
      interactionMethodDistribution
    ).reduce((sum, count) => sum + count, 0);

    // Count contacts with at least one interaction
    const contactsWithInteractions = await Contact.countDocuments({
      user: userId,
      "interactionHistory.0": { $exists: true },
    });

    // Total contacts
    const totalContacts = await Contact.countDocuments({ user: userId });

    // Engagement rate (percentage of contacts with at least one interaction)
    const engagementRate =
      totalContacts > 0
        ? Math.round((contactsWithInteractions / totalContacts) * 100)
        : 0;

    // Prepare response
    const networkingAnalytics = {
      totalContacts,
      contactsWithInteractions,
      totalInteractions,
      engagementRate,
      relationshipDistribution,
      interactionMethodDistribution,
      interactionTimeline,
      topContacts,
      followUpsDue,
    };

    res.status(200).json({
      success: true,
      data: networkingAnalytics,
    });
  } catch (error) {
    console.error("Networking analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve networking analytics",
      error: error.message,
    });
  }
};
