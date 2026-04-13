require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

const fixAvatars = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const brokenUrl = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
        const newUrl = "https://res.cloudinary.com/dm67p1o4o/image/upload/v1699999999/default_avatar.png";

        const result = await User.updateMany(
            { pic: brokenUrl },
            { $set: { pic: newUrl } }
        );

        console.log(`Updated ${result.modifiedCount} users with broken avatar URLs.`);
        process.exit();
    } catch (error) {
        console.error('Error fixing avatars:', error);
        process.exit(1);
    }
};

fixAvatars();
