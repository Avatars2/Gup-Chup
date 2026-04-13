const express = require("express");
const { sendMessage, allMessages, markAsRead, editMessage, deleteMessage } = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/markAsRead").post(protect, markAsRead);
router.route("/edit").put(protect, editMessage);
router.route("/delete").post(protect, deleteMessage); // Using POST for delete for simpler body handling in some environments, but logical delete
router.route("/:chatId").get(protect, allMessages);

module.exports = router;