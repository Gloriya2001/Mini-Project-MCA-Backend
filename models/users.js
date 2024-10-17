const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    doctorId: { type: String, required: false },
    labId: { type: String, required: false },
    technicianId: { type: String, required: false }
});

module.exports = mongoose.model("User", userSchema);
