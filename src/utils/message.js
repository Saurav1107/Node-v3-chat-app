const messageGenerate = (username,text) => {
  return {
    message : text,
    username,
    createdAt: new Date().getTime()
  }
}

const generateLocationMessage = (username,text) => {
  return {
    message : text,
    username,
    createdAt : new Date().getTime()
  }
}

module.exports = {
  messageGenerate,
  generateLocationMessage
}