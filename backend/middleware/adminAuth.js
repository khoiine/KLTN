import e from 'express';
import  jwt  from 'jsonwebtoken';

const adminAuth = async(req,res,next)=>{
    try {
        const {token} = req.headers;
        if (!token) {
            return res.json({success:false,message:"Không có quyền truy cập, vui lòng đăng nhập lại"}); 
        }
        
        const token_decode = jwt.verify(token,process.env.JWT_SECRET);
        
        // Kiểm tra token admin mới (object với isAdmin: true)
        if (typeof token_decode === 'object' && token_decode.isAdmin === true) {
            next();
        }
        // Kiểm tra token admin cũ (string)
        else if (typeof token_decode === 'string' && token_decode === process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD) {
            next();
        }
        // Không phải admin
        else {
            return res.json({success:false,message:"Không có quyền truy cập, vui lòng đăng nhập lại"}); 
        }
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

export default adminAuth;