import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://react-my-burger-f2b91.firebaseio.com/'
})

export default instance;