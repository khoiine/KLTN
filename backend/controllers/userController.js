import validator from "validator";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import crypto from 'crypto';
import userModel from "../models/userModel.js";
import transporter from '../config/nodemailer.js';
import { OAuth2Client } from 'google-auth-library';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Google Login
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()
        const { email, name, sub: googleId, picture } = payload

        if (!email) {
            return res.json({ success: false, message: 'Email không hợp lệ từ Google' })
        }

        // Kiểm tra user tồn tại
        let user = await userModel.findOne({ email })

        if (!user) {
            // Tạo tài khoản với Google
            user = await userModel.create({
                name,
                email,
                password: await bcrypt.hash(googleId, 10), // Use Google ID as password hash
                googleId,
                avatar: picture
            })
        } else if (!user.googleId) {
            // Liên kết tài khoản Google
            user.googleId = googleId
            if (picture) user.avatar = picture
            await user.save()
        }

        // Nếu là admin
        const isAdmin = email === process.env.ADMIN_EMAIL

        // Tạo token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({
            success: true,
            token,
            isAdmin,
            message: 'Đăng nhập Google thành công'
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: 'Đăng nhập Google thất bại' })
    }
}

//Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Kiểm tra nếu là tài khoản admin
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email: email, isAdmin: true }, process.env.JWT_SECRET);
            return res.json({
                success: true,
                token,
                isAdmin: true,
                message: "Đăng nhập admin thành công"
            });
        }

        //checking user exists or not
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Tài khoản không tồn tại" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id);
            res.json({
                success: true,
                token,
                isAdmin: false,
                message: "Đăng nhập thành công"
            });
        }
        else {
            res.json({ success: false, message: "Email hoặc mật khẩu không hợp lệ." });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//Route for user registration
const registerUser = async (req, res) => {

    try {
        const { name, email, password, phone, address, city, district, ward } = req.body;

        //checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Tài khoản đã tồn tại" });
        }

        //validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Vui lòng nhập đúng định dạng email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Vui lòng nhập mật khẩu mạnh hơn" });
        }

        //hasing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            phone: phone || '',
            address: address || '',
            city: city || '',
            district: district || '',
            ward: ward || ''
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        res.json({ success: true, token });


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });

    }
}

//Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' })
        }

        // Ensure an admin user exists in DB so we have a valid ObjectId for sender
        let adminUser = await userModel.findOne({ email: process.env.ADMIN_EMAIL })
        if (!adminUser) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
            adminUser = await userModel.create({
                name: 'Admin',
                email: process.env.ADMIN_EMAIL,
                password: hashedPassword
            })
        }

        // Include id and role in token
        const token = jwt.sign(
            { id: adminUser._id, email: adminUser.email, role: 'admin' },
            process.env.JWT_SECRET
        )
        return res.json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Route to get user info
const getUserInfo = async (req, res) => {
    try {
        const { userId, isAdmin, adminEmail } = req.body;

        // Nếu là admin
        if (isAdmin) {
            return res.json({
                success: true,
                user: {
                    name: "Admin",
                    email: adminEmail,
                    isAdmin: true
                }
            });
        }

        // Nếu là user thường
        const user = await userModel.findById(userId).select('-password');
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            user: {
                ...user.toObject(),
                isAdmin: false
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, city, district, ward } = req.body;

        if (!userId) return res.json({ success: false, message: "Thiếu userId" });

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (city) updateData.city = city;
        if (district) updateData.district = district;
        if (ward) updateData.ward = ward;

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true });
        res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        // Bao gồm cả password (đã hash) để admin có thể xem
        const users = await userModel.find().sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Forgot Password - Send Reset Email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'Email không tồn tại' })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = Date.now() + 3600000 // 1 hour

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiry = resetTokenExpiry
        await user.save()

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Đặt lại mật khẩu - LKFashionStore',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Yêu cầu đặt lại mật khẩu</h2>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
                    <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
                        Đặt lại mật khẩu
                    </a>
                    <p>Link này sẽ hết hạn sau 1 giờ.</p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)

        res.json({ success: true, message: 'Email đặt lại mật khẩu đã được gửi' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Reset Password with Token
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        const { password } = req.body

        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() }
        })

        if (!user) {
            return res.json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' })
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)
        user.resetPasswordToken = undefined
        user.resetPasswordExpiry = undefined
        await user.save()

        res.json({ success: true, message: 'Đặt lại mật khẩu thành công' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Change password
const changePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        if (newPassword.length < 6) {
            return res.json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'Người dùng không tồn tại' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await userModel.findByIdAndUpdate(userId, { password: hashedPassword });

        res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// List all users
const listUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('-__v').lean()
        return res.json({ success: true, users })
    } catch (err) {
        console.error('listUsers error', err)
        return res.status(500).json({ success: false, message: err.message })
    }
}

// Get single user
const getUser = async (req, res) => {
    try {
        const id = req.params.id
        if (!id) return res.status(400).json({ success: false, message: 'id required' })
        const user = await userModel.findById(id).select('-__v').lean()
        if (!user) return res.status(404).json({ success: false, message: 'User not found' })
        return res.json({ success: true, user })
    } catch (err) {
        console.error('getUser error', err)
        return res.status(500).json({ success: false, message: err.message })
    }
}

// Register / create user (admin)
const registerUserAdmin = async (req, res) => {
    try {
        const { name, email, phone, password, address, city, district, ward } = req.body
        if (!email || !password) return res.status(400).json({ success: false, message: 'email and password required' })

        const exists = await userModel.findOne({ email })
        if (exists) return res.status(400).json({ success: false, message: 'Email already taken' })

        const hashed = await bcrypt.hash(password, 10)
        const newUser = new userModel({
            name, email, phone, password: hashed, address, city, district, ward
        })
        await newUser.save()
        return res.json({ success: true, message: 'User created', user: { _id: newUser._id, email: newUser.email, name: newUser.name } })
    } catch (err) {
        console.error('registerUser error', err)
        return res.status(500).json({ success: false, message: err.message })
    }
}

// Update user
const updateUser = async (req, res) => {
    try {
        const { userId, name, email, phone, password, address, city, district, ward } = req.body
        if (!userId) return res.status(400).json({ success: false, message: 'userId required' })

        const update = {}
        if (name !== undefined) update.name = name
        if (email !== undefined) update.email = email
        if (phone !== undefined) update.phone = phone
        if (address !== undefined) update.address = address
        if (city !== undefined) update.city = city
        if (district !== undefined) update.district = district
        if (ward !== undefined) update.ward = ward
        if (password) update.password = await bcrypt.hash(password, 10)

        const user = await userModel.findByIdAndUpdate(userId, update, { new: true }).select('-__v')
        if (!user) return res.status(404).json({ success: false, message: 'User not found' })
        return res.json({ success: true, message: 'User updated', user })
    } catch (err) {
        console.error('updateUser error', err)
        return res.status(500).json({ success: false, message: err.message })
    }
}

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body
        if (!userId) return res.status(400).json({ success: false, message: 'userId required' })

        const user = await userModel.findById(userId)
        if (!user) return res.status(404).json({ success: false, message: 'User not found' })

        await userModel.findByIdAndDelete(userId)
        console.log(`[USER] deleted ${userId}`)
        return res.json({ success: true, message: 'User deleted' })
    } catch (err) {
        console.error('deleteUser error', err)
        return res.status(500).json({ success: false, message: err.message })
    }
}

export { loginUser, registerUser, adminLogin, getUserInfo, updateProfile, getAllUsers, forgotPassword, resetPassword, changePassword, googleLogin, listUsers, getUser, registerUserAdmin, updateUser, deleteUser }