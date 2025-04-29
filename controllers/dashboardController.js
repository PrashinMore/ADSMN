const moment = require('moment');
const { User, Score, sequelize } = require('../models');
const { Op } = require('sequelize');
const { decryptUserId } = require('../utils/encryption');

exports.getWeeklyScores = async (req, res, next) => {
  try {
    const userWeeklyScores = await Score.findAll({
      attributes: [
        'week',
        [sequelize.fn('SUM', sequelize.col('score')), 'totalScore']
      ],
      where: { userId: req.user.id },
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

  const userRank = rankings.find(r => r.userId === req.user.id);
  const rank = userRank ? userRank.user_rank : null;
  
  if (weekData.dataValues.totalScore > 0) {
    weeklyRanks.push({
      weekNo: week,
      rank: rank || '-',
      totalScore: weekData.dataValues.totalScore
    });
  }
  
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