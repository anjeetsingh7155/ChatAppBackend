import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  room: { type: String, required: true },
  text: { type: String, required: true }
}, {
  timestamps: true
});

export const Message = mongoose.model('Message', MessageSchema);
