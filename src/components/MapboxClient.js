import MapboxDirectionsFactory from '@mapbox/mapbox-sdk/services/directions';

const clientOptions = {accessToken: 'pk.eyJ1IjoiZmFzaGlvbmRldjEiLCJhIjoiY2tscjlmM3diMTNkaTJvbnc1OXBpbzVwNiJ9.yJIaRGA7FoRXjQCSPj3WEA'};
const directionsClient = MapboxDirectionsFactory(clientOptions);

export {directionsClient};
