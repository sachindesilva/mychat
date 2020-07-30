import firebase from 'firebase';

const firebaseconfig = {
    apiKey: "AIzaSyBHdaOLdeOfUrK1F-3pHQjuOPFoEIrNz8Q",
    databaseURL: "https://mychat-5bf2b.firebaseio.com/",
    projectId: "mychat-5bf2b",
    appId: "1:251123684072:android:4d916601f3319c1bd26f5d",
};

export default firebase.initializeApp(firebaseconfig);
