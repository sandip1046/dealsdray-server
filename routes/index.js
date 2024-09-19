import express, { Router } from 'express';
import zod from "zod";
import { User } from "../db.js";
import jwtPassword from "../config.js";
import jwt from "jsonwebtoken";



const router = Router();


//creating the schema for zod validation
const schema_signup = zod.object({
    UserName: zod.string().min(6, { message: "Invalid username address" }),
    password: zod.string().min(6, { message: "Must be 6 or more characters long" }).max(20,"Password must be in between 6 and 20 length")
});

//here will work on all the endpoint of API.
//under the hood this /signup api looks like this "api/v1/user/signup"
router.post("/user/signup", async (req, res) => {
    const sucess = schema_signup.safeParse(req.body);
    if (!sucess) {
        return res.status(411).json({
            message: "user already taken / Incorrect inputs"
        });

    }
    const existingUser = await User.findOne({ UserName: req.body.UserName });
    if (existingUser) {
        return res.status(411).send({
            message: "user already taken / Incorrect inputs"
        });
    }

    //if username name not exist in the database then
    const newUser  = await User.create({
        UserName: req.body.UserName,
        password: req.body.password,
    })

    const userId = newUser ._Id;


    //creating a token
    const token = jwt.sign({ userId }, jwtPassword);

    res.status(200).json({
        message: "User created successfully",
        token: token
    });
});

//creating the schema for the user validation during signin using zod
const schema_signin = zod.object({
    UserName: zod.string().email({ message: "Invalid username address" }),
    password: zod.string().min(6, { message: "Must be 6 or more characters long" })
})
//now creating signin routes
// router.post("/user/signin", async (req, res) => {
//     //doing the zod validation
//     const sucess = schema_signin.safeParse(req.body);
//     if (!sucess) {
//         return res.status(411).json({
//             message: "Error while logging in"
//         })
//     }
//     else {
//         const checkCredential = await User.findOne({
//             UserName: req.body.UserName,
//             password: req.body.password
//         })
//         if (!checkCredential) {
//             return res.status(411).send({
//                 message: "Invalid username or password"
//             })
//         }

//         var token = jwt.sign({ username: req.body.UserName }, "jwtPassword");
//         return res.json({
//             token,
//         });
//     }
// })

router.post("/user/signin", async (req, res) => {
    const success = schema_signin.safeParse(req.body); // Validate the request body
    if (!success) {
        return res.status(411).json({
            message: "Error while logging in"
        });
    }
    const checkCredential = await User.findOne({ // Check if the user exists
        UserName: req.body.UserName,
        password: req.body.password
    });
    if (!checkCredential) {
        return res.status(411).send({
            message: "Invalid username or password"
        });
    }

    // Sign token with user ID
    var token = jwt.sign({ username: req.body.UserName, userId: checkCredential._id }, "jwtPassword");
    return res.json({
        token,
        user: checkCredential // Return the user object including _id
    });
});

// now creating a Route to get users from the backend, filterable via firstName/lastName


router.get("/get-user", async (req, res) => {

    const users = await User.find(req.query); // Find users based on query parameters
    res.json(users);
});


export default router;