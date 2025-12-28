const ActivityLog = require('../models/activity_log');

async function getActivityLogs(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      resourceType, 
      status,
      startDate,
      endDate,
      userId
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};

    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const totalLogs = await ActivityLog.countDocuments(filter);

    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total: totalLogs,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalLogs / limitNum)
        }
      }
    });
  } catch (error) {
    // console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error.message
    });
  }
}

async function getActivityLogById(req, res) {
  try {
    const { id } = req.params;

    const log = await ActivityLog.findById(id)
      .populate('user', 'name email')
      .populate('resourceId');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    // console.error('Error fetching activity log:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity log',
      error: error.message
    });
  }
}

async function getActivityStats(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Get action statistics
    const actionStats = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get resource type statistics
    const resourceTypeStats = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$resourceType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get status statistics
    const statusStats = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get top users by activity
    const topUsers = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          count: 1,
          'user.name': 1,
          'user.email': 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        actionStats,
        resourceTypeStats,
        statusStats,
        topUsers
      }
    });
  } catch (error) {
    // console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity stats',
      error: error.message
    });
  }
}

module.exports = {
  getActivityLogs,
  getActivityLogById,
  getActivityStats
}; 