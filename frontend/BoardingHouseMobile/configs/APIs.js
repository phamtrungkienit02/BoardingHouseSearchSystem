import axios from "axios";


// const BASE_URL = 'http://192.168.159.1:9000/';
// const BASE_URL = 'https://thanhduong.pythonanywhere.com'; 
const BASE_URL = 'https://phamtrungkienit02.pythonanywhere.com';

export const endpoints = {
    'categories': '/categories/',
    'districts': '/districts/',

    'rooms': '/rooms/',
    'room-details': (roomId) => `/rooms/${roomId}/`,
    'room_comments': (roomId) => `/rooms/${roomId}/comments/`,
    'add_comments_room': (roomId) => `/rooms/${roomId}/add_comments/`,

    'register': '/users/',
    'login': '/o/token/',
    'current-user': '/users/current-user/',

    'posts': '/posts/',
    'post-details': (postId) => `/posts/${postId}/`,
    'post_comments': (postId) => `/posts/${postId}/comments/`,
    'add_comments_post': (postId) => `/posts/${postId}/add_comments/`,
}

export const authApi = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}
export default axios.create({
    baseURL: BASE_URL
});