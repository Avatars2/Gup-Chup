const express = require("express");
const { accessChat, createGroupChat, fetchChats } = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware"); // JWT Check
const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);

module.exports = router;