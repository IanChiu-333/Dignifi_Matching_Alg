const db = require('./firebase'); // Import the initialized Firestore instance

async function getProviders() {
  try {
    const providersSnapshot = await db.collection('providers').get();
    const providers = [];
    providersSnapshot.forEach(doc => {
      providers.push({ id: doc.id, ...doc.data() });
    });
    return providers;
  } catch (error) {
    console.error('Error retrieving providers:', error);
    throw error;
  }
}

async function getUser(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('Error retrieving user:', error);
    throw error;
  }
}

(async () => {
  try {
    //Link this to an input on the front end!
    const userId = '';
    const user = await getUser(userId);
    const providers = await getProviders();
    const matches = findMatches(user, providers);
    feature_sort(matches);
  } catch (error) {
    console.error('Error:', error);
  }
})();

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