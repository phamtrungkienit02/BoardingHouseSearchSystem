import axios from "axios";


const BASE_URL = 'http://192.168.159.1:9000/';
// const BASE_URL = 'https://thanhduong.pythonanywhere.com';

export const endpoints = {
    'categories': '/categories/',
}

export default axios.create({
    baseURL: BASE_URL
});