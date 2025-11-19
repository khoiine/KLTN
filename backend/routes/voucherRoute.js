import express from 'express'
import { listVouchers, createVoucher, updateVoucher, deleteVoucher } from '../controllers/voucherController.js'
const router = express.Router()

router.get('/list', listVouchers)
router.post('/create', createVoucher)
router.post('/update', updateVoucher)
router.post('/delete', deleteVoucher)

export default router
