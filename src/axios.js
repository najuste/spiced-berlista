import axios from 'axios';

var instance = axios.create({
    //passing configuration to instance
    xsrfCookieName: 'mytoken',
    xsrfHeaderName: 'csrf-token'
});

export default instance;
