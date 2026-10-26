import mongoose from 'mongoose';

const UserSession = new mongoose.Schema({
  sp_id: { type: String, required: true },
  sp_access_token: { type: String, required: true },
  sp_refresh_token: { type: String, required: true },
  // Only the SHA-256 digest of the random browser session token is stored.
  session_id: { type: String, unique: true, required: true },
  access_token_expires_at: { type: Date, required: true },
  expires_at: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true, collection: 'UserSession' });

export default mongoose.models.UserSession || mongoose.model('UserSession', UserSession);
