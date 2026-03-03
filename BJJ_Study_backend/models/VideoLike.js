import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const VideoLike = sequelize.define('VideoLike', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_auth0_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    video_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'video_likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['user_auth0_id', 'video_id'],
      },
    ],
  });

  return VideoLike;
};
