const LOCAL           =false;// window.location.hostname.toLocaleLowerCase().indexOf('localhost') >= 0;
const SITE_URL = LOCAL ? 'http://localhost:5000' : 'https://green-pokerstats.herokuapp.com';
//console.log('SITE_URL',SITE_URL);

export default {
    SITE_URL
}

