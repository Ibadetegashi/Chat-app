const users = [];

const addUser = ({ id, name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    // validate the username and room parameters
    if (!name || !room) {
        return {
            error: 'Username and room are required'
        }
    }
    // check that the user does not already exist
    const existingUser = users.find(u => u.name === name && u.room === room);
    if (existingUser) {
        return {
            error: `The user ${name} is already in the chat`
        };
    }

    const user = { id, name, room };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find(u => u.id === id);
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter(u => u.room === room);

}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}