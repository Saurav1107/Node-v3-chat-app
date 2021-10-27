const users = []

const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  //Validate the data
  if (!username || !room) {
    return {
      error: 'Username and Room are required'
    }
  }

  //Check for existing User

  const existingUser = users.find(user => {
    return user.room === room && user.username === username
  })

  //Validate Username
  if (existingUser) {
    return {
      error: 'Username Already exists'
    }
  }

  //Store User
  const user = { id, username, room }
  users.push(user);
  return {
    user
  }
}

const getUser = (id) => {
  return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room)
}

const removeUser = (id) => {

  const userIndex = users.findIndex((user) => user.id === id)
  if(userIndex !== -1){
    return users.splice(userIndex,1)[0]
  }

}

module.exports= {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}