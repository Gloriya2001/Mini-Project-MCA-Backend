const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./models/users"); // Assuming this includes role and other fields

const app = express();

app.use(express.json()); // To handle JSON objects
app.use(cors()); // Security purpose

// Connects to MongoDB
mongoose.connect("mongodb+srv://gloria2001:gloria2001@cluster0.ipg35w1.mongodb.net/min-pjt-appdb?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("MongoDB connection error:", error));

// Login Endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.json({ status: "Invalid email" });
    }

    // Validate password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.json({ status: "Incorrect Password" });
    }

    // Generate JWT Token
    jwt.sign({ email: user.email, role: user.role }, "mini", { expiresIn: "1d" }, (error, token) => {
        if (error) {
            return res.json({ status: "error", errorMessage: error });
        } else {
            return res.json({ status: "success", token, userId: user._id });
        }
    });
});

// Signup Endpoint
app.post("/signup", async (req, res) => {
    const { name, email, password, confirmPassword, role, doctorId, labId, technicianId } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.json({ status: "Passwords do not match" });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Check if email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.json({ status: "Email already exists" });
    }

    // Create new user based on role and other provided fields
    let newUser = new userModel({
        name,
        email,
        password: hashedPassword,
        role
    });

    // Add conditional fields based on the role
    if (role === "Doctor") {
        newUser.doctorId = doctorId;
    } else if (role === "Technician") {
        newUser.labId = labId;
        newUser.technicianId = technicianId;
    } else if (role === "Admin") {
        newUser.labId = labId;
    }

    // Save new user to the database
    await newUser.save();
    return res.json({ status: "success" });
});

// Start Server
app.listen(3030, () => {
    console.log("Server Started on port 3030");
});
