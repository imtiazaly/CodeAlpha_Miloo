import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../../config/db.js";

class Follow extends Model<
  InferAttributes<Follow>,
  InferCreationAttributes<Follow>
> {
  declare id: CreationOptional<number>;
  declare followerId: number;
  declare followingId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Follow.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    followerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "follower_id",
    },
    followingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "following_id",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "follows",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["follower_id", "following_id"],
      },
    ],
  },
);

export default Follow;
