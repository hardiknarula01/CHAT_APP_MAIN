const socket = io()

const $messageForm = document.getElementById('message_form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.getElementById('send-location')
const $messages = document.querySelector('#message')

const messageTemplate = document.querySelector('#message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true})


const autoScroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight

    const scrolloffset = $messages.scrollTop + visibleHeight

    if(Math.round(containerHeight - newMessageHeight) <= Math.round(scrolloffset)){
            $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', ({username, message, createdAt}) => {
    const html =Mustache.render(messageTemplate,{
        username,
        message,
        createdAt:moment(createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

socket.on('locationMesaage', (URL)=>{
    const html =Mustache.render(locationMessageTemplate,{
        username:URL.username,
        message:URL.url,
        createdAt:moment(URL.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData', ({room,users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

document.getElementById('message_form').addEventListener('submit', (e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
  
    const message = $messageFormInput.value;
    socket.emit('sendMessage', message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return
        }
    });

})

$sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geoloctaion is not supported by your browser.')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation', {lat:position.coords.latitude, lon:position.coords.longitude}
            ,()=>{
                $sendLocationButton.removeAttribute('disabled')
                console.log('location was delivered');
            }
        )
    })
})


socket.emit('join', {username, room}, (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

