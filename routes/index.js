import express, { Router } from 'express';
import zod from "zod";
import { User } from "../db.js";
import jwtPassword from "../config.js";
import jwt from "jsonwebtoken";



const router = Router();

// router.use("/user", userRouter);






//creating the schema for zod validation
const schema_signup = zod.object({

    // username: zod.string().min(5,{ message: "Must be 5 or more characters long" }).max(30,{ message: "Must be 30 or fewer characters long" }),
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
router.post("/user/signin", async (req, res) => {
    //doing the zod validation
    const sucess = schema_signin.safeParse(req.body);
    if (!sucess) {
        return res.status(411).json({
            message: "Error while logging in"
        })
    }
    else {
        const checkCredential = await User.find({
            UserName: req.body.UserName,
            password: req.body.password
        })
        if (!checkCredential) {
            return res.status(411).send({
                message: "Error while logging in"
            })
        }

        var token = jwt.sign({ username: req.body.UserName }, "jwtPassword");
        return res.json({
            token,
        });
    }
})

// now creating a Route to get users from the backend, filterable via firstName/lastName
const getSchema = zod.object({
    password: zod.string().min(6).optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.get("/user/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            UserName: user.UserName,
            _id: user._id
        }))
    })
})


export default router;