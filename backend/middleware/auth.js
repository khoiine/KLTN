import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {

    const {token} = req.headers;

    if (!token) {
        return res.json({success: false, message: 'Không có quyền truy cập, vui lòng đăng nhập lại'});
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // Kiểm tra nếu token_decode là object có thuộc tính isAdmin
        if (typeof token_decode === 'object' && token_decode.isAdmin) {
            req.body.isAdmin = true;
            req.body.adminEmail = token_decode.email;
        } 
        // Kiểm tra nếu token_decode là string (token admin cũ)
        else if (typeof token_decode === 'string' && token_decode === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            req.body.isAdmin = true;
            req.body.adminEmail = process.env.ADMIN_EMAIL;
        }
        // Nếu token_decode là object có thuộc tính id (user thường)
        else if (typeof token_decode === 'object' && token_decode.id) {
            req.body.userId = token_decode.id;
            req.body.isAdmin = false;
        }
        // Nếu không match với format nào
        else {
            return res.json({success: false, message: 'Token không hợp lệ'});
        }
        
        next();

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }

};

export default authUser;