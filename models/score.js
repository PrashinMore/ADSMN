module.exports = (sequelize, DataTypes) => {
  const Score = sequelize.define('Score', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 50,
        max: 500
      }
    },
    week: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  Score.associate = (models) => {
    Score.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Score;
};
