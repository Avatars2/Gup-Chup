const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register Logic
const register = async (req, res) => {
  try {
    const { name, mobile, password, pic } = req.body;
    
    if (!name || !mobile || !password) {
      return res.status(400).json({ error: "Please enter all fields" });
    }

    const userExists = await User.findOne({ mobile });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await User.create({
      name,
      mobile,
      password,
      pic,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        pic: user.pic,
        createdAt: user.createdAt,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ error: "Failed to create user" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login Logic
const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ error: "Please enter mobile number and password" });
    }

    const user = await User.findOne({ mobile });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        pic: user.pic,
        createdAt: user.createdAt,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: "Invalid mobile number or password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search Users Logic
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { mobile: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select("-password");
    
    res.send(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Profile Logic
const updateProfile = async (req, res) => {
  try {
    const { name, pic } = req.body;
    
    console.log('Updating profile for user:', req.user._id);
    console.log('Update data:', { name, pic });

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      // Update only name and pic, don't touch password
      user.name = name || user.name;
      user.pic = pic || user.pic;

      // Use findOneAndUpdate to avoid pre-save middleware
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { name: user.name, pic: user.pic },
        { new: true, runValidators: false }
      ).select('-password');

      console.log('Profile updated successfully:', updatedUser);

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        mobile: updatedUser.mobile,
        pic: updatedUser.pic,
        createdAt: updatedUser.createdAt,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, searchUsers, updateProfile };