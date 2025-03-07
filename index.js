import express from "express";
import { connectDB } from "./config/db.js";
import { apiRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
const app = express();
const port = process.env.PORT

connectDB()
app.use(express.json())
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello World!!!!!");
});

app.use('/api',apiRouter)

app.all("*",(req,res)=>{
    res.status(404).json({message:"Endpoint does not exist"})
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
