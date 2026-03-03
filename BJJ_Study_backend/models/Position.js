import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Position = sequelize.define('Position', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  }, {
    tableName: 'positions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return Position;
};
