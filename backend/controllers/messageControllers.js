const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = async (req, res) => {
  const { content, chatId, fileUrl, fileType, fileName } = req.body;
  if ((!content && !fileUrl) || !chatId) {
    return res.status(400).json({ message: "Content/File and chatId are required" });
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    fileUrl: fileUrl,
    fileType: fileType,
    fileName: fileName,
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, { path: "chat.users", select: "name pic mobile" });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(400).json({ message: error.message });
  }
};

const allMessages = async (req, res) => {
  try {
    // Automatically mark all messages from others as read before fetching
    await Message.updateMany(
      { chat: req.params.chatId, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic mobile")
      .populate("readBy", "name pic mobile")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(400).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  const { chatId } = req.body;
  try {
    await Message.updateMany(
      { chat: chatId, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const editMessage = async (req, res) => {
  const { messageId, content } = req.body;

  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Only sender can edit
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to edit this message" });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate("sender", "name pic")
      .populate("chat");

    res.json(updatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  const { messageId } = req.body;

  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Only sender can delete for everyone
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this message" });
    }

    message.content = "🚫 This message was deleted";
    message.fileUrl = undefined;
    message.fileType = undefined;
    message.fileName = undefined;
    message.isDeleted = true;
    await message.save();

    res.json({ _id: messageId, isDeleted: true, chat: message.chat });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendMessage, allMessages, markAsRead, editMessage, deleteMessage };