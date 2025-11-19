import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatCurrency } from '../../../admin/src/App'

const Vouchers = ({ token }) => {
    const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
    const [vouchers, setVouchers] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ code: '', type: 'percent', amount: 0, minOrder: 0, maxUses: 0, expiresAt: '', active: true })
    const [editingId, setEditingId] = useState(null)

    const fetch = useCallback(async () => {
        try {
            const res = await axios.get(`${apiBase}/api/voucher/list`, { headers: { token } })
            if (res.data?.success) setVouchers(res.data.vouchers || [])
            else toast.error(res.data?.message || 'Failed to load vouchers')
        } catch (err) {
            console.error('fetch vouchers', err)
            toast.error(err?.response?.data?.message || err.message)
        }
    }, [apiBase, token])

    useEffect(() => { fetch() }, [fetch])

    const openCreate = () => { setEditingId(null); setForm({ code: '', type: 'percent', amount: 0, minOrder: 0, maxUses: 0, expiresAt: '', active: true }); setShowModal(true) }
    const openEdit = (v) => { setEditingId(v._id); setForm({ code: v.code, type: v.type, amount: v.amount, minOrder: v.minOrder || 0, maxUses: v.maxUses || 0, expiresAt: v.expiresAt ? new Date(v.expiresAt).toISOString().slice(0, 10) : '', active: v.active }); setShowModal(true) }

    const handleSave = async () => {
        try {
            if (!form.code || form.amount == null) { toast.error('Vui lòng nhập Mã voucher và Tổng tiền giảm'); return }
            if (editingId) {
                const res = await axios.post(`${apiBase}/api/voucher/update`, { voucherId: editingId, ...form }, { headers: { token } })
                if (res.data?.success) { toast.success('Đã cập nhật'); setShowModal(false); fetch(); return }
                toast.error(res.data?.message || 'Update failed')
            } else {
                const res = await axios.post(`${apiBase}/api/voucher/create`, form, { headers: { token } })
                if (res.data?.success) { toast.success('Đã tạo voucher'); setShowModal(false); fetch(); return }
                toast.error(res.data?.message || 'Create failed')
            }
        } catch (err) {
            console.error('save voucher', err)
            toast.error(err?.response?.data?.message || err.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa voucher?')) return
        try {
            const res = await axios.post(`${apiBase}/api/voucher/delete`, { voucherId: id }, { headers: { token } })
            if (res.data?.success) { toast.success('Đã xóa'); fetch() } else toast.error(res.data?.message || 'Delete failed')
        } catch (err) { console.error('delete voucher', err); toast.error(err?.response?.data?.message || err.message) }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Quản lý Voucher</h3>
                <button onClick={openCreate} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Tạo voucher</button>
            </div>

            <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left">Mã voucher</th>
                        <th className="px-4 py-2 text-left">Loại voucher</th>
                        <th className="px-4 py-2 text-left">Tổng tiền giảm</th>
                        <th className="px-4 py-2 text-left">Đơn hàng tối thiểu</th>
                        <th className="px-4 py-2 text-left">Trạng thái</th>
                        <th className="px-4 py-2 text-left">Ngày hết hạn</th>
                        <th className="px-4 py-2 text-left">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {vouchers.map(v => (
                        <tr key={v._id} className="border-t">
                            <td className="px-4 py-2">{v.code}</td>
                            <td className="px-4 py-2">
                                {v.type === 'percent' ? 'Theo phần trăm' : 'Theo số tiền'}
                            </td>
                            <td className="px-4 py-2">
                                {v.type === 'percent'
                                    ? `${v.amount}%`
                                    : formatCurrency(v.amount)}
                            </td>
                            <td className="px-4 py-2">{formatCurrency(v.minOrder)}</td>
                            <td className="px-4 py-2">{v.active ? 'Đã kích hoạt' : 'Chưa kích hoạt'}</td>
                            <td className="px-4 py-2">
                                {new Date(v.expiresAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-4 py-2">
                                <button onClick={() => openEdit(v)} className="px-2 py-1 bg-blue-600 text-white rounded mr-2">Sửa</button>
                                <button onClick={() => handleDelete(v._id)} className="px-2 py-1 bg-red-600 text-white rounded">Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-20 z-50">
                    <div className="bg-white p-4 rounded w-96">
                        <h4 className="mb-2">{editingId ? 'Cập nhật voucher' : 'Tạo voucher'}</h4>
                        <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Mã voucher" className="w-full mb-2 p-2 border" />
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="Loại voucher" className="w-full mb-2 p-2 border">
                            <option value="percent">Giảm theo phần trăm</option>
                            <option value="fixed">Giảm theo số tiền</option>
                        </select>
                        <input type="number" value={form.amount || ""} placeholder="Tổng tiền giảm" onChange={e => setForm({ ...form, amount: e.target.value === "" ? 0 : Number(e.target.value) })} className="w-full mb-2 p-2 border" />
                        <input type="number" value={form.minOrder || ""} placeholder="Đơn hàng tối thiểu" onChange={e => setForm({ ...form, minOrder: e.target.value === "" ? 0 : Number(e.target.value) })} className="w-full mb-2 p-2 border" />
                        <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="w-full mb-2 p-2 border" />
                        <label className="flex items-center gap-2 mb-2">
                            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                            Kích hoạt
                        </label>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowModal(false)} className="px-3 py-1 bg-gray-300 rounded">Hủy</button>
                            <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded">Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Vouchers