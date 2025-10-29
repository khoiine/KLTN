import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import dashboardRouter from './routes/dashboardRoute.js';
import categoryRoutes from './routes/categoryRoutes.js';
import subCategoryRouter from './routes/subCategoryRoute.js';
import chatRouter from './routes/chatRoute.js';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import blogRouter from './routes/blogRoute.js';

//App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB()
connectCloudinary()

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.ADMIN_URL || 'http://localhost:5174'
    ],
    methods: ['GET','POST'],
    credentials: true
  }
})

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = decoded
    next()
  } catch {
    next(new Error('unauthorized'))
  }
})

io.on('connection', (socket) => {
  socket.on('chat:join', (chatId) => {
    if (chatId) socket.join(`chat_${chatId}`)
  })
})


//Middlewares
app.use(express.json());
app.use(cors());

//API Endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order',orderRouter)
app.use('/api/review', reviewRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/category', categoryRoutes);
app.use('/api/subcategory', subCategoryRouter)
app.use('/api/chat', chatRouter);
app.use('/api/blog', blogRouter);

app.get('/',(req,res)=>{
    res.send("API working");
});

app.set('io', io)


server.listen(process.env.PORT || 4000, () => console.log('Server started'))