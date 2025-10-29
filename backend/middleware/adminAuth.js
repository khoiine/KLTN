import jwt from 'jsonwebtoken'

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers
    if (!token) return res.json({ success: false, message: 'Not Authorized Login Again' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Validate admin by email or role
    if (decoded.email !== process.env.ADMIN_EMAIL && decoded.role !== 'admin') {
      return res.json({ success: false, message: 'Not Authorized Login Again' })
    }

    // Pass admin id to request (do NOT rely on req.body)
    if (decoded.id) {
      req.userId = decoded.id
    }

    req.userRole = 'admin'
    next()
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export default adminAuth;