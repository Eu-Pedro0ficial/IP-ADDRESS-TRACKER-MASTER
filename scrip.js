'use strict';
const searchLocation = document.querySelector('#search-location');
const ipAddress = document.querySelector('#ip-address');
const locationAddress = document.querySelector('#location');
const timezone = document.querySelector('#time-zone');
const isp = document.querySelector('#isp');

let points = [];
let map = L.map('map').setView([51.505, -0.09], 16);
points.push(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

function getValueInField(){
    return searchLocation.value;
}

async function getIpClient(){
    try{
        const response = await axios.get('https://ipinfo.io/json');
        return response.data.ip
    } catch ( error ){
        return '';
    }
}
const ipClient = await getIpClient()
    .then(response => response)

function renderInformation(value, key){
    switch (key) {
        case 'ipAddress':
            ipAddress.textContent = value;
            break;
        case 'location':
            locationAddress.textContent = value;
            break;
        case 'timezone':
            timezone.textContent = value;
            break;
        case 'isp':
            isp.textContent = value
            break;
        default:
            window.alert("Erro no sistema, por favor tente mais tarde!");
            break;
    }
}

function renderMapAndInformation(ipAddress){
    if(!ipAddress){
        return
    }

    fetch(`https://geo.ipify.org/api/v2/country,city?apiKey=at_M7NbdwfvHhIRLPMdKYRR33dGUleGh&ipAddress=${ipAddress}`)
    .then(response => response.json())
    .then(data => {
        renderInformation(data.ip, 'ipAddress');
        renderInformation(`${data.location.city}, ${data.location.country} ${data.location.postalCode}`, 'location');
        renderInformation(`UTC ${data.location.timezone}`, 'timezone');
        renderInformation(data.isp, 'isp');

        let lat = data.location.lat;
        let lng = data.location.lng;

        for (let i = 0;i < points.length; i++) {
            map.removeLayer(points[i]);
        }
        map.setView(new L.LatLng(lat, lng), 16);
        var point = L.marker([lat, lng]).addTo(map).bindPopup('');
        points.push(point);
        
    })
    .catch(error => {
        console.error("Erro:",error);
    });

}

renderMapAndInformation(ipClient);

function renderingNewLocation(){
    renderMapAndInformation(getValueInField());
}

const error = {
    errorExist: false
}

function checkForError(){
    if(error.errorExist){
        return true;
    }
}

searchLocation.addEventListener('input', event => {
    const pattern = new RegExp('[A-Za-z]');
    const contentValue = searchLocation.value;
    
    if(pattern.test(contentValue)){
        error.errorExist = true
    }else{
        error.errorExist = false
    }
    
});
document.querySelector('#submit-buttom').addEventListener('click', () => {
    if(checkForError()){
        window.alert('Make sure the field has a valid value!');
        return;
    }

    renderingNewLocation();
});
document.addEventListener('keyup', event =>{

    if(event.key === 'Enter'){
        if(checkForError()){
            window.alert('Make sure the field has a valid value!');
            return;
        }
        
        renderingNewLocation();
    }
});
