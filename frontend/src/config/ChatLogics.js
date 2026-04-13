export const getSender = (loggedUser, users) => {
  if (!users || users.length < 2) {
    return 'Unknown User';
  }
  
  if (!loggedUser || !loggedUser._id) {
    return users[0]?.name || 'Unknown User';
  }

  const otherUser = users[0]._id === loggedUser._id ? users[1] : users[0];
  return otherUser?.name || 'Unknown User';
};

export const getSenderPic = (loggedUser, users) => {
  if (!users || users.length < 2) {
    return null;
  }
  
  if (!loggedUser || !loggedUser._id) {
    return users[0]?.pic || null;
  }

  const otherUser = users[0]._id === loggedUser._id ? users[1] : users[0];
  return otherUser?.pic || null;
};

export const getSenderFull = (loggedUser, users) => {
  if (!users || users.length < 2) {
    return { name: 'Unknown User', pic: null };
  }
  
  if (!loggedUser || !loggedUser._id) {
    return users[0] || { name: 'Unknown User', pic: null };
  }

  const otherUser = users[0]._id === loggedUser._id ? users[1] : users[0];
  return otherUser || { name: 'Unknown User', pic: null };
};

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id !== undefined
  );
};

export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return 'auto';
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};
