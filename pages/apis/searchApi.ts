import axios from 'axios';

const searchApi = axios.create({
 baseURL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
 params:{
    limit :5,
    language: 'es',
    autocomplete: true,
    access_token:'pk.eyJ1IjoiZXJhbW9zMTUiLCJhIjoiY200cmkxM2xhMDRyYzJycHV4YmN0eWppcSJ9.Lvuuy5lsY6mB2evr8XvPxA'
 }
})

export default searchApi;

