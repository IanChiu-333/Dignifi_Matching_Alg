const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, getDoc } = require("firebase/firestore");

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHVRpE8hGurx73rfAlCQV5e_TRPwXnTlk",
  authDomain: "diginifi.firebaseapp.com",
  databaseURL: "https://diginifi-default-rtdb.firebaseio.com",
  projectId: "diginifi",
  storageBucket: "diginifi.appspot.com",
  messagingSenderId: "808749677810",
  appId: "1:808749677810:web:fd12c2c2253b8d2645246b",
  measurementId: "G-L19X4ZMTBG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getProviders() {
  try {
    const providersSnapshot = await getDocs(collection(db, 'providers')); // Fetch the entire collection
    const providers = providersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })); // Map over documents to construct the array
    let providerList = [];
    providers.forEach(providerDoc => {
      const eligibilityCriteria = providerDoc.providerOnboardingInfo?.generalService?.eligibilityCriteria;
      const features = providerDoc.providerOnboardingInfo?.generalService?.features;
      const service = providerDoc.providerOnboardingInfo?.generalService?.serviceCategories;
      providerN = {};
      providerN.name = providerDoc.id;
      if (eligibilityCriteria !== undefined) {
        providerN.eligibilityCriteria = eligibilityCriteria;
      }
      if (features !== undefined) {
        providerN.features = features;
      }
      if (service !== undefined) {
        providerN.service = service;
      }
      providerList.push(providerN);

    });
    return providerList;
  } catch (error) {
    console.error('Error retrieving providers:', error);
    throw error; // Throw error for caller to handle
  }
}

async function getUser(userId) {
  try {
    const userDocRef = doc(db, 'users', userId); // Reference the document
    const userDoc = await getDoc(userDocRef); // Fetch the document
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    return { id: userDoc.id, ...userDoc.data() }; // Return user data
  } catch (error) {
    console.error('Error retrieving user:', error);
    throw error; // Throw error for caller to handle
  }
}

(async () => {
    try {
      console.log('Fetching providers...');
        const providers = await getProviders();
        console.log('Providers:', providers);
      } catch (error) {
        console.error('Test failed:', error);
      }
  
      // console.log('Fetching user...');
      // const userId = '1BLE1Jco1lSmQXwtCGbuaTWOY2H3'; // Replace with an actual user ID
      // const user = await getUser(userId);
      // console.log('User:', user);
  })();