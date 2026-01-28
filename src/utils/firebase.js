import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCcJqGyyq0HcLI6nvt2GglV12Ik_LYB7k4",
    authDomain: "coisodo-ea7ef.firebaseapp.com",
    projectId: "coisodo-ea7ef",
    storageBucket: "coisodo-ea7ef.firebasestorage.app",
    messagingSenderId: "267490978943",
    appId: "1:267490978943:web:cb448dbd48958a4495a34a",
    measurementId: "G-8GRZ7Q2TK8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection };
