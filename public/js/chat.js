const socket = io();

//Elements 
const $sendMessageForm = document.querySelector('#sendMessageForm');
const $messageInput = $sendMessageForm.querySelector('input');
const $messageButton = $sendMessageForm.querySelector('button');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');
//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
//Options
const user = Qs.parse(location.search, {
    ignoreQueryPrefix: true //ignore query prefix ?
})
console.log("User", user);

socket.on('locationMessage', (location) => {
    console.log(location);
    const html = Mustache.render(locationTemplate, {
        username: location.name.toUpperCase(),
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a'),

    });
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.name.toUpperCase(),
        createdAt: moment(message.createdAt).format('h:mm a'),
        text: message.text
    })
    $messages.insertAdjacentHTML('beforeend', html); // inserts the rendered HTML into the DOM
})

$sendMessageForm.addEventListener('submit', e => {
    e.preventDefault();
    console.log('Form submitted');
    $messageButton.setAttribute('disabled', 'disabled');
    let message = e.target.elements.message.value;

    // Check if the message is empty
    if (message.trim() === '') {
        console.log('Message is empty. Not sending.');
        $messageButton.removeAttribute('disabled');
        return;
    }

    socket.emit('sendMessage', message, (error) => {
        console.log('Message sent');
        if (error) {
            return console.log(error);
        }
        $messageButton.removeAttribute('disabled');
        $messageInput.value = '';
        $messageInput.focus();
    });
});

socket.on('sendMessage', (message, callback) => {
    // Check if the message is empty
    const error = message.trim() === '' ? 'Message cannot be empty' : null;

    if (error) {
        return callback(error);
    }

    io.emit('message', generateMessage(user.name, message));
    callback(null);
});

document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Please enable geo location!')
    }
    $sendLocation.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {

        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, () => {
            $sendLocation.removeAttribute('disabled');
        })
    })
})

//The 'navigator' object provides information about the browser environment in which the script is running.

socket.emit('join', user, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})