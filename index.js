import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import authRoutes from './routes/AuthRoute.js'
import contactsRoutes from './routes/ContactRoute.js'
import setupSocket from './socket.js'
import messageRoutes from './routes/MessageRoute.js'
import channelRoutes from './routes/ChannelRoute.js'

dotenv.config();

const app = express()
const port = process.env.PORT || 4000
const databaseUrl = process.env.DATABASE_URL

app.use(
    cors({
        origin:process.env.ORIGIN,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true 
    })
)

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParser())
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/channel", channelRoutes)

app.get('/', function (req, res) {
    res.send('Hello World')
  })

const server = app.listen(3000, ()=> {
    console.log(`Server is running at http://localhost:${port}`)
})

setupSocket(server);
mongoose
.connect(databaseUrl)
.then( ()=> {console.log("Database connection Established")})
.catch( err => {console.log("Error :", err.message)})