// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { collection, getDocs } from 'firebase/firestore';

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
    return providers;
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

//Finds matches by accepting two dictionary objects for user and provider attributes
function findMatches(user, providers) {
    let matches = {};

    // Initialize matches with each provider having nested dictionaries
    providers.forEach(provider => {
        matches[provider.name] = {
            eligibilities: {},
            categories: {},
            features: {}
        };
    });

    let invalids = [];

    // Iterate through each provider
    providers.forEach(provider => {
        const providerName = provider.name;

        // Check eligibilities
        if (eligibiiltyMatch(user.eligibilities, provider.eligibilities)) {
            matches[providerName].eligibilities = user.eligibilities;
        } else {
            invalids.push(providerName);
        }

        // Check features and categories if the provider is not invalid
        if (!invalids.includes(providerName)) {
            matches[providerName].features = features_and_categories_match(user.features, provider.features);
            matches[providerName].categories = features_and_categories_match(user.categories, provider.categories);
        }
    });

    for (const providerName in matches) {
        if (Object.keys(matches[providerName].eligibilities).length === 0) {
            delete matches[providerName];
        }
    }

    return matches;
}

//Finds matching eligibilities - only returns exact matches BOOLEAN
function eligibiiltyMatch(userEligibilities, providerEligibilities) {
    for (const key in userEligibilities) {
        if (userEligibilities[key] !== providerEligibilities[key]) {
            return false;
        }
    }
    return true;
}

//Finds features and category matches - Just returns the matching ones DICT
function features_and_categories_match(user_f_or_c, provider_f_or_c) {
    let matches = {};

    for (const key in user_f_or_c) {
        if (user_f_or_c[key] === provider_f_or_c[key]) {
            matches[key] = user_f_or_c[key];
        }
    }

    return matches;
}

//Takes in matches and sorts by features - most are first, RETURNS ARRAY
function feature_sort(matches) {
    let order = [];
    const temp_matches = {...matches};
    while (Object.keys(temp_matches).length > 0) {
        let name = "";
        let max = 0;
        for (const key in temp_matches) {
            if (max < Object.keys(temp_matches[key].features).length) {
                max = Object.keys(temp_matches[key].features).length;
                name = key;
            }
        }
        order.push(name);
        delete temp_matches[name];
    }

    return order;
}