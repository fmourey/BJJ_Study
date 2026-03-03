import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    auth0_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: DataTypes.STRING,
    pseudo: DataTypes.STRING,
    birthdate: DataTypes.STRING,
    profile_photo: DataTypes.STRING,
    bjj_club: DataTypes.STRING,
    bjj_belt: DataTypes.STRING,
    bjj_city: DataTypes.STRING,
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return User;
};
