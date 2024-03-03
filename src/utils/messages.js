const generateMessage = (name, text) => {
    return {
        name,
        text,
        createdAt: new Date().getTime(),
    }
}

const generateLocationMessage = (name, url) => {
    return {
        name,
        url,
        createdAt: new Date().getTime(),
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}