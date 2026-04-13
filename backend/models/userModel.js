const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, unique: true, required: true, match: /^[0-9]{10}$/ },
  password: { type: String, required: true },
  pic: { type: String, default: "https://res.cloudinary.com/dm67p1o4o/image/upload/v1699999999/default_avatar.png" },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

// Password hashing before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);