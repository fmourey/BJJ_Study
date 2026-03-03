import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import dbConfig from '../config/database.js';
import UserModel from './User.js';
import VideoModel from './Video.js';
import VideoLikeModel from './VideoLike.js';
import PositionModel from './Position.js';
import CommentModel from './Comment.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(config);

const db = {
  sequelize,
  Sequelize,
  User: UserModel(sequelize),
  Video: VideoModel(sequelize),
  VideoLike: VideoLikeModel(sequelize),
  Position: PositionModel(sequelize),
  Comment: CommentModel(sequelize),
};

// Définir les associations
db.User.hasMany(db.Video, { foreignKey: 'owner_auth0_id', sourceKey: 'auth0_id' });
db.Video.belongsTo(db.User, { foreignKey: 'owner_auth0_id', targetKey: 'auth0_id' });

db.User.hasMany(db.VideoLike, { foreignKey: 'user_auth0_id', sourceKey: 'auth0_id' });
db.VideoLike.belongsTo(db.User, { foreignKey: 'user_auth0_id', targetKey: 'auth0_id' });

db.Video.hasMany(db.VideoLike, { foreignKey: 'video_id' });
db.VideoLike.belongsTo(db.Video, { foreignKey: 'video_id' });

db.User.hasMany(db.Comment, { foreignKey: 'user_auth0_id', sourceKey: 'auth0_id' });
db.Comment.belongsTo(db.User, { foreignKey: 'user_auth0_id', targetKey: 'auth0_id' });

db.Video.hasMany(db.Comment, { foreignKey: 'video_id' });
db.Comment.belongsTo(db.Video, { foreignKey: 'video_id' });

export default db;
