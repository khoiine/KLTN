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
        const { name, email, password } = req.body;

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
            password: hashedPassword
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
        const { userId } = req.body;
        const { name, phone, address, city, district, ward } = req.body;

        // Find user by ID
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Update user profile
        await userModel.findByIdAndUpdate(userId, {
            name,
            phone,
            address,
            city,
            district,
            ward
        });

        res.json({ success: true, message: "Profile updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

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
            subject: 'Đặt lại mật khẩu - E-Commerce Shop',
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

export { loginUser, registerUser, adminLogin, getUserInfo, updateProfile, getAllUsers, forgotPassword, resetPassword, changePassword , googleLogin }