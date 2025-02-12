import socket from 'socket.io-client'

let socketInstance = null;

export const initialiseSocket = (projectId) => {
    socketInstance = socket(import.meta.env.VITE_BASE_URL, {
        auth: {
            token: localStorage.getItem('token')
        },
        query:{
            projectId
        }
    })
    return socketInstance;
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}
export const recieveMessage = (eventName, cb) => {
    socketInstance.on(eventName, cb);
}


