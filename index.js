//server/index.js

import express from "express";
import cors from "cors";

//import the router from the file routs/index.js
import router from "./routes/index.js";
import empRouter from "./routes/Employee.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv"; 
dotenv.config();

// cloudinary config
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_SECRET_KEY,
})

const App = express();

App.use(cors({
    origin: ["https://dealsdray-client.vercel.app/"],
    credentials: true,
}));
App.use(express.json({ limit: "50mb" }));


//app.use will send the whatever request comes to the /api/v1 endpoint to  the Router. the router will handle the request
App.use("/api/v1", router);
App.use("/api/v1", empRouter);


App.listen(3000, () => console.log("Server running on port 3000"));