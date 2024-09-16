const users = []

const addUser = ({id, username, room}) => {

    username = username.trim().toUpperCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: 'Username and Room are required!!'
        }
    }

    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error: 'Username is in Use!!!'
        }
    }

    const user = {id,username,room};
    users.push(user)

    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return id === user.id
    })

    if(index !== -1){
        return users.splice(index,1)[0]
    }

}

const getUser = (id)=>{
    const index = users.findIndex((user) => {
        return id === user.id
    })

    if(index !== -1){
        return users[index]
    }

}

const getAllUserOfRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getAllUserOfRoom,
    getUser
}