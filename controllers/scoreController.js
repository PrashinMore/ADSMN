const moment = require('moment');
const { User, Score, sequelize } = require('../models');
const { Op } = require('sequelize');
const { decryptUserId } = require('../utils/encryption');
const imageGenerator = require('../utils/imageGenerator');

const getWeekNumber = (date) => {
  const firstWeekStart = moment('2025-04-18');
  const currentDate = moment(date);
  
  const diffWeeks = Math.floor(currentDate.diff(firstWeekStart, 'days') / 7);
  return diffWeeks + 1;
};

const getCurrentWeekDates = () => {
  const currentDate = moment();
  let weekStart = moment(currentDate).day(5);
  if (currentDate.day() < 5) {
    weekStart = weekStart.subtract(1, 'week');
  }
  
  const weekEnd = moment(weekStart).add(6, 'days');
  
  return {
    weekStart: weekStart.startOf('day'),
    weekEnd: weekEnd.endOf('day')
  };
};

exports.saveScore = async (req, res, next) => {
  try {
    const { score } = req.body;

    if (score < 50 || score > 500) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 50 and 500'
      });
    }

    const today = moment().startOf('day');
    const tomorrow = moment(today).add(1, 'day');
    
    const scoresSubmittedToday = await Score.count({
      where: {
        userId: req.user.id,
        createdAt: {
          [Op.between]: [today.toDate(), tomorrow.toDate()]
        }
      }
    });

    if (scoresSubmittedToday >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 scores allowed per day'
      });
    }

    const currentWeek = getWeekNumber(new Date());

    await Score.create({
      userId: req.user.id,
      score,
      week: currentWeek,
      createdAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Score saved successfully'
    });
  } catch (error) {
    console.error('Error in saveScore:', error);
    next(error);
  }
};

exports.getScoreCard = async (req, res, next) => {
  try {
    const totalScore = await Score.sum('score', {
      where: { userId: req.user.id }
    }) || 0;

    const userRankData = await sequelize.query(`
      SELECT 
        s.userId as id,
        u.name, 
        SUM(s.score) as total_score,
        RANK() OVER (ORDER BY SUM(s.score) DESC) as user_rank
      FROM Scores s
      JOIN Users u ON s.userId = u.id
      GROUP BY s.userId, u.name
      `, { type: sequelize.QueryTypes.SELECT });
      
      const userRankInfo = userRankData.find(u => u.id === req.user.id);
      const currentRank = userRankInfo ? userRankInfo.user_rank : '-';
      

    const scoreCardData = {
      userName: req.user.name,
      rank: currentRank,
      totalScore,
      userId: req.user.id
    };

    const imageResult = await imageGenerator.generateScoreCard(scoreCardData);

    return res.status(200).json({
      success: true,
      imageUrl: imageResult.url
    });
  } catch (error) {
    console.error('Error in getScoreCard:', error);
    next(error);
  }
};