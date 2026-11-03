// ============================================================
//  Firebase Configuration for Imposter Online (Sync Room)
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyAwyIpbi-w7iBGRYr3qX362otGMzWyZCok",
  authDomain: "imposter-2a5f9.firebaseapp.com",
  databaseURL: "https://imposter-2a5f9-default-rtdb.firebaseio.com",
  projectId: "imposter-2a5f9",
  storageBucket: "imposter-2a5f9.firebasestorage.app",
  messagingSenderId: "607258521057",
  appId: "1:607258521057:web:0c67d2c171cadfd77e76a0",
  measurementId: "G-B41JSNPDM2"
};

// Initialize Firebase using the Compat SDK included in HTML
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();
}
