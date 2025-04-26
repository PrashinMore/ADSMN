const moment = require('moment');
const { User, Score, sequelize } = require('../models');
const { Op } = require('sequelize');
const { decryptUserId } = require('../utils/encryption');

exports.getWeeklyScores = async (req, res, next) => {
  try {
    const { userId } = req.body || {};


    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    let decryptedUserId;
    try {
      decryptedUserId = decryptUserId(userId);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findByPk(decryptedUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userWeeklyScores = await Score.findAll({
      attributes: [
        'week',
        [sequelize.fn('SUM', sequelize.col('score')), 'totalScore']
      ],
      where: { userId: decryptedUserId },
      group: ['week'],
      order: [['week', 'ASC']]
    });

const weeklyRanks = [];
for (const weekData of userWeeklyScores) {
  const week = weekData.week;
  
  const rankings = await sequelize.query(`
    SELECT 
      userId, 
      SUM(score) AS total_score,
      RANK() OVER (ORDER BY SUM(score) DESC) AS user_rank
    FROM Scores
    WHERE week = :week
    GROUP BY userId
  `, { 
    replacements: { week },
    type: sequelize.QueryTypes.SELECT 
  });

  const userRank = rankings.find(r => r.userId === decryptedUserId);
  const rank = userRank ? userRank.user_rank : null;
  
  weeklyRanks.push({
    weekNo: week,
    rank: rank || '-',
    totalScore: weekData.dataValues.totalScore || 0
  });
}

    return res.status(200).json({
      success: true,
      weeks: weeklyRanks
    });
  } catch (error) {
    console.error('Error in getWeeklyScores:', error);
    next(error);
  }
};