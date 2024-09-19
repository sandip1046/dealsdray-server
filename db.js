//server/db.js
import { connect, Schema, model } from "mongoose";

//connecting the mongodb
connect("mongodb+srv://sandipyadav7541:Upendra%401975@cluster0.s0tueka.mongodb.net/dealsdray");

//now creating the user schema

//adding constraint to the property
const userSchema = new Schema({
    UserName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 6,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
}, { timestamps: true })

// now employee schema
const employeeSchema = new Schema({
    Name: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
    },
    Contact: {
        type: Number,
        required: true,
    },
    Designation: {
        type: String,
        required: true,
    },
    Gender: {
        type: String,
        required: true,
    },
    Course: {
        type: String,
        required: true,
    },
    Image: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    }
}, { timestamps: true })


export const User = model("User", userSchema);
export const Employee = model("Employee", employeeSchema);


