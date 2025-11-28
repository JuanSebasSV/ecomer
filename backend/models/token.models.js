// backend/models/token.models.js
import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user',
    required: true 
  },
  token: { 
    type: String, 
    required: true,
    unique: true 
  },
  codigo: {
    type: String,
    required: true
  },
  verificado: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 3600 // 3600 segundos = 1 hora
  }
});

const PasswordResetToken = mongoose.model(
  "PasswordResetToken", 
  resetTokenSchema, 
  "password_reset_tokens"
);

export default PasswordResetToken;