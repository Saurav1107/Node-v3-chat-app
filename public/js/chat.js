const socket = io()

// socket.on('countUpdatedEvent',(count) => {
//   console.log('The count has been updated',count);
// })

// document.querySelector('#inc').addEventListener('click',() => {
//   console.log('clicked');
//   socket.emit('increment')
// })

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate= document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})


const autoScroll= () => {
  //New Message Element
  const $newMessage = $messages.lastElementChild

  //Height of the new Message
  const newMessageStyle = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyle.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //Visible Height
  const visibleHeight = $messages.offsetHeight 

  //Height of Message Container
  const containerHeight = $messages.scrollHeight

  //How far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight


  if(containerHeight - newMessageHeight >= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
  }

}


$messageForm.addEventListener('submit', e => {
  e.preventDefault()

  $messageFormButton.setAttribute('disabled', 'disabled')

  const message = e.target.elements.message.value

  socket.emit('sendMessage', message, error => {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    if (error) {
      return console.log(error)
    }
    console.log('message was delivered!')
  })
})

socket.on('roomData',({room , users}) => {
    const html = Mustache.render(sidebarTemplate,{
      room,
      users
    })
    document.querySelector('#sidebar').innerHTML= html
})

socket.on('message', msg => {
  const html = Mustache.render(messageTemplate, {
    message: msg.message,
    username: msg.username,
    createdAt: moment(msg.createdAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('locationMessage', url => {
  const html = Mustache.render(urlTemplate, {
    url: url.message,
    username: url.username,
    createdAt: moment(url.createdAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

$locationButton.addEventListener('click', () => {
  $locationButton.setAttribute('disabled', 'disabled')

  if (!navigator.geolocation) {
    return alert('Geolocation Not supported By Browser')
  }

  navigator.geolocation.getCurrentPosition(position => {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }

    socket.emit('location', location, () => {
      $locationButton.removeAttribute('disabled')
      console.log('Location Shared!')
    })
  })
})

socket.emit('join',{ username, room },(error) => {
  if(error){
    alert(error);
    location.href = '/'
  }
})