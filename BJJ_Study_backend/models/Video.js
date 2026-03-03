import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Video = sequelize.define('Video', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    owner_auth0_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    youtube_url: DataTypes.STRING,
    local_file: DataTypes.STRING,
    position: DataTypes.STRING,
    tags: DataTypes.STRING,
    start_time: DataTypes.STRING,
    end_time: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {
    tableName: 'videos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return Video;
};
