import axios from 'axios';


const directionsApi = axios.create({
    baseURL: 'https://api.mapbox.com/directions/v5/mapbox/driving',
    params: {
        alternatives: false,
        geometries: 'geojson',
        overview: 'simplified',
        steps: false,
        access_token: 'pk.eyJ1IjoiZXJhbW9zMTUiLCJhIjoiY200cmkxM2xhMDRyYzJycHV4YmN0eWppcSJ9.Lvuuy5lsY6mB2evr8XvPxA'
    }
})


export default directionsApi;