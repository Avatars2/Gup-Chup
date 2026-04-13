const express = require("express");
const { register, login, searchUsers, updateProfile } = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/").get(protect, searchUsers);
router.route("/profile").put(protect, updateProfile);

module.exports = router;
