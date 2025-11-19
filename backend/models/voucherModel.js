import mongoose from 'mongoose'

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  amount: { type: Number, required: true }, 
  minOrder: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Voucher', voucherSchema)
