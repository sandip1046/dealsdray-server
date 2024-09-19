//server/routes/Employee.js
import cloudinary from "cloudinary";
import { Router } from 'express';
import zod from "zod";
import { Employee } from "../db.js";



const empRouter = Router();

const schema_employee = zod.object({
    Name: zod.string().min(3, { message: "Invalid Name" }),
    Email: zod.string().email({ message: "Invalid Email" }),
    Contact: zod.string().min(10, { message: "Invalid Mobile Number" }),
    Designation: zod.string().min(2, { message: "Invalid Designation" }),
    Gender: zod.string().min(3, { message: "Invalid gender" }),
    Course: zod.string().min(3, { message: "Invalid Course" }),
    Image: zod.string().regex(/^data:image\/[a-zA-Z]+;base64,/, { message: "Invalid Image format" }).optional(),

})

empRouter.post("/employee/create-employee", async (req, res) => {
    try {
        const result = schema_employee.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Validation error",
                errors: result.error.errors  // Log the actual validation errors
            });
        }
        const data = req.body;
        const Image = data.Image;
        if (Image) {
            const myCloud = await cloudinary.v2.uploader.upload(Image, {
                folder: "Employee"
            });

            data.Image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }

        }
        const employee = await Employee.create(data);
        res.status(201).json({
            success: true,
            employee
        })

    } catch (error) {
        return res.status(411).json({
            message: error.message
        });
    }
});

empRouter.put("/employee/update-employee/:id", async (req, res) => {
    try {
        const data = req.body;
        const Image = data.Image;
        const empId = req.params.id;
        const empData = await Employee.findById(empId);

        if (!empData) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }

        if (Image) {
            if (typeof Image === 'string' && !Image.startsWith("https")) {
                // Image is a new image string (base64 or URL)
                await cloudinary.v2.uploader.destroy(empData.Image.public_id);
                const myCloud = await cloudinary.v2.uploader.upload(Image, {
                    folder: "Employee",
                });

                data.Image = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                };
            } else if (typeof Image === 'object' && Image.url) {
                // Image is already an object, no need to re-upload
                data.Image = {
                    public_id: Image.public_id || empData?.Image.public_id,
                    url: Image.url
                };
            } else if (typeof Image === 'string' && Image.startsWith("https")) {
                // Image is already a URL string
                data.Image = {
                    public_id: empData?.Image.public_id,
                    url: Image
                };
            }
        }

        const employee = await Employee.findByIdAndUpdate(empId, { $set: data }, { new: true });

        res.status(201).json({
            success: true,
            employee,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
});

// Delete an employee by ID
empRouter.delete("/employee/delete-employee/:id", async (req, res) => {
    try {
        const empId = req.params.id;
        const empData = await Employee.findById(empId);

        if (!empData) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }

        await cloudinary.v2.uploader.destroy(empData.Image.public_id);
        await Employee.findByIdAndDelete(empId);

        res.status(200).json({
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
});
// Get all employees
empRouter.get("/employee/get-employee", async (req, res) => {
    try {
        const employee = await Employee.find();
        res.status(200).json({
            success: true,
            employee
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
});

// Get a single employee by ID
empRouter.get("/employee/get-employee/:id", async (req, res) => {
    try {
        const empId = req.params.id;
        const employee = await Employee.findById(empId);
        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            })
        }
        res.status(200).json({
            success: true,
            employee
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
});
export default empRouter;