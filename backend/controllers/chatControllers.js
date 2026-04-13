const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// 1. Access or Create 1-on-1 Chat
const accessChat = async (req, res) => {
  const { userId } = req.body; // Jiske saath chat karni hai uski ID

  if (!userId) {
    return res.status(400).json({ message: "UserId is required" });
  }

  try {
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    }).populate("users", "-password").populate("latestMessage");

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
      
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
      res.status(200).json(FullChat);
    }
  } catch (error) {
    console.error('Error in accessChat:', error);
    res.status(400).json({ message: error.message });
  }
};

// 2. Create Group Chat
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  var users = JSON.parse(req.body.users);
  users.push(req.user._id); // Current login user ko bhi add karo

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (error) {
    console.error('Error in createGroupChat:', error);
    res.status(400).json({ message: error.message });
  }
};

// 3. Fetch all chats for a user
const fetchChats = async (req, res) => {
  try {
    console.log('Fetching chats for user:', req.user._id);
    const results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // Populate the latestMessage sender details
    const populatedResults = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic mobile",
    });

    console.log('Chats found:', populatedResults.length);
    res.status(200).json(populatedResults);
  } catch (error) {
    console.error('Error in fetchChats:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { accessChat, createGroupChat, fetchChats };