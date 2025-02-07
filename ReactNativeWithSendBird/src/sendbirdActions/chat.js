import { sbGetOpenChannel } from './openChannel';
import { sbGetGroupChannel } from './groupChannel';
import SendBird from 'sendbird';

export const sbCreatePreviousMessageListQuery = (channelUrl, isOpenChannel) => {
  return new Promise((resolve, reject) => {
    if (isOpenChannel) {
      sbGetOpenChannel(channelUrl)
        .then(channel => resolve(channel.createPreviousMessageListQuery()))
        .catch(error => reject(error));
    } else {
      sbGetGroupChannel(channelUrl)
        .then(channel => resolve(channel.createPreviousMessageListQuery()))
        .catch(error => reject(error));
    }
  });
};

export const sbGetMessageList = previousMessageListQuery => {
  const limit = 30;
  const reverse = true;
  return new Promise((resolve, reject) => {
    previousMessageListQuery.load(limit, reverse, (messages, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(messages);
      }
    });
  });
};

export const sbSendTextMessage = (channel, textMessage, callback) => {
  if (channel.isGroupChannel()) {
    channel.endTyping();
  }
  return channel.sendUserMessage(textMessage, (message, error) => {
    callback(message, error);
  });
};

export const sbSendFileMessage = (channel, file, progressCallback, callback) => {
  const sb = SendBird.getInstance()
  const params = new sb.FileMessageParams()
  params.file = file
  params.data = ''
  params.customType = ''
  params.thumbnailSizes = [{ maxWidth: 160, maxHeight: 160 }]

  return channel.sendFileMessage(params,
    (event, reqId) => {
      var progress = event.loaded / event.total
      progressCallback(reqId, progress)
    },
    (message, error) => {
      callback(message, error)
    })
};

export const sbTypingStart = channelUrl => {
  return new Promise((resolve, reject) => {
    sbGetGroupChannel(channelUrl)
      .then(channel => {
        channel.startTyping();
        resolve(channel);
      })
      .catch(error => reject(error));
  });
};

export const sbTypingEnd = channelUrl => {
  return new Promise((resolve, reject) => {
    sbGetGroupChannel(channelUrl)
      .then(channel => {
        channel.endTyping();
        resolve(channel);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const sbIsTyping = channel => {
  if (channel.isTyping()) {
    const typingMembers = channel.getTypingMembers();
    if (typingMembers.length == 1) {
      return `${typingMembers[0].nickname} is typing...`;
    } else {
      return 'several member are typing...';
    }
  } else {
    return '';
  }
};

export const sbChannelDeleteMessage = (channel, message) => {
  return new Promise((resolve, reject) => {
    channel.deleteMessage(message, (response, error) => {
      error ? reject(error) : resolve(response);
    });
  });
};

export const sbChannelUpdateMessage = (channel, message, contents) => {
  return new Promise((resolve, reject) => {
    channel.updateUserMessage(message.messageId, contents, null, null, (response, error) => {
      error ? reject(error) : resolve(response);
    });
  });
};

export const sbMarkAsRead = ({ channelUrl, channel }) => {
  if (channel) {
    channel.markAsRead();
  } else {
    sbGetGroupChannel(channelUrl).then(channel => channel.markAsRead());
  }
};
