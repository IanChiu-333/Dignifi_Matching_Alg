const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://<your-database-name>.firebaseio.com'
});

const db = admin.firestore();

// Function to retrieve a user document
exports.getUser = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.query.id;
    const userSnapshot = await db.collection("users").doc(userId).get();
    if (!userSnapshot.exists) {
      res.status(404).send("User not found");
      return;
    }
    res.status(200).json(userSnapshot.data());
  } catch (error) {
    res.status(500).send("Error retrieving user: " + error);
  }
});

// Function to retrieve provider documents
exports.getProviders = functions.https.onRequest(async (req, res) => {
  try {
    const providersSnapshot = await db.collection("providers").get();
    const providers = [];
    providersSnapshot.forEach(doc => {
      providers.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).send("Error retrieving providers: " + error);
  }
});
  


exports.runMatchingAlgorithm = functions.https.onRequest(async (req, res) => {
  try {
    // Access tags or other data sent from the frontend via req.body
    const { userId, tags } = req.body;

    // Example matching algorithm using Firestore data
    const matches = {};
    const usersSnapshot = await db.collection("users").get();

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      // Replace with your matching logic based on `tags` or other criteria
      const score = findMatches(userData.tags, tags);
      if (score > 0.5) {  // Example threshold for a "good match"
        matches.push({ id: doc.id, ...userData, score });
      }
    });

    // Send the matches back to the frontend
    res.status(200).json(matches);
  } catch (error) {
    console.error("Error running matching algorithm:", error);
    res.status(500).send("Error running matching algorithm");
  }
});

//Finds matches by accepting two dictionary objects for user and provider attributes
function findMatches(user, providers) {
    let matches = new Object();
    let invalids = [];
    
    //Not a fan of this triple for loop - think of something to make more efficient
    //Might need some input on this, currently one loop to key through elig, cat, and feat in user
    //One loop to key through each provider in the dictionary
    //Final loop to look through each true or false attribute
    for (const key in user) {
        if (key == "eligibilities") {
            for (let i=0; i < providers.length; i++) {
                if (eligibiiltyMatch(user[key], providers[i][key])) {
                    matches[providers[i]["name"]] = user[key];
                } else {
                    invalids.push(providers[i]["name"])
                }
            }
        }
        if (key == "features" || key == "categories") {
            for (let i=0; i < providers.length; i++) {
                if (!invalids.includes(providers[i]["name"])) {
                    const providerName = providers[i]["name"];
                    const match = features_and_categories_match(user[key], providers[i][key]);

                    if (matches[providerName]) {
                        matches[providerName] = { ...matches[providerName], ...match };
                    } else {
                        matches[providerName] = match;
                    }
                }
            }
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