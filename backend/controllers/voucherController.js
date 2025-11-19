import Voucher from '../models/voucherModel.js'

export const listVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 })
    return res.json({ success: true, vouchers })
  } catch (err) {
    console.error('listVouchers', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

export const createVoucher = async (req, res) => {
  try {
    const { code, type = 'percent', amount, minOrder = 0, maxUses = 0, expiresAt = null, active = true } = req.body
    if (!code || amount == null) return res.status(400).json({ success: false, message: 'code and amount required' })
    const normalized = code.toUpperCase().trim()
    const exists = await Voucher.findOne({ code: normalized })
    if (exists) return res.status(400).json({ success: false, message: 'Mã voucher đã tồn tại' })
    const v = new Voucher({ code: normalized, type, amount, minOrder, maxUses, expiresAt, active })
    await v.save()
    return res.json({ success: true, voucher: v })
  } catch (err) {
    console.error('createVoucher', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

export const updateVoucher = async (req, res) => {
  try {
    const { voucherId, ...update } = req.body
    if (!voucherId) return res.status(400).json({ success: false, message: 'voucherId required' })
    if (update.code) update.code = update.code.toUpperCase().trim()
    const v = await Voucher.findByIdAndUpdate(voucherId, update, { new: true })
    if (!v) return res.status(404).json({ success: false, message: 'Voucher not found' })
    return res.json({ success: true, voucher: v })
  } catch (err) {
    console.error('updateVoucher', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

export const deleteVoucher = async (req, res) => {
  try {
    const { voucherId } = req.body
    if (!voucherId) return res.status(400).json({ success: false, message: 'voucherId required' })
    await Voucher.findByIdAndDelete(voucherId)
    return res.json({ success: true })
  } catch (err) {
    console.error('deleteVoucher', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}
