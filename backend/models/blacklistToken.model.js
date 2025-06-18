//backend/models/blacklistToken.model.js
import mongoose from "mongoose";

const BlacklistTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
});

// TTL index on expiresAt
BlacklistTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlacklistToken = mongoose.model('BlacklistToken', BlacklistTokenSchema);

export default BlacklistToken; // use `module.exports` for CommonJS
