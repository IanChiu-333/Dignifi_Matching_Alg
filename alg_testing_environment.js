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


//For local alg testing
function main() {
    //Test User 1 with random criterion
    const test_user_1 = {
        eligibilities: {
            "Within 5 Years of Incarceration": true,
            "Homeless": true,
            "Elderly": false,
            "Veteran": false,
            "30 Days Clean and Sober": false,
            "Sex Offender": true,
        },
        features: {
            "Local Hiring and Fair Minimum": false,
            "Formerly Incarcerated Leadership": true,
            "Youth Programs Available": true,
            "Voluntary": true,
            "In Custody Review": false,
        },
        categories: {
            "Community": true,
            "Education": false,
            "Employment": false,
            "Financial": true,
            "First Steps": true,
            "Friends and Family": false,
        },
    };
    //Some sample test providers
    const providers = [
        { 
            //Eligibility Difference: Elderly
            //Features Difference: Local Hiring
            //Categories Difference: Employment
            name: "Provider 1", 
            eligibilities: {
                "Within 5 Years of Incarceration": true,
                "Homeless": true,
                "Elderly": true,
                "Veteran": false,
                "30 Days Clean and Sober": false,
                "Sex Offender": true,
            },
            features: {
                "Local Hiring and Fair Minimum": true,
                "Formerly Incarcerated Leadership": true,
                "Youth Programs Available": true,
                "Voluntary": true,
                "In Custody Review": false,
            },
            categories: {
                "Community": true,
                "Education": false,
                "Employment": true,
                "Financial": true,
                "First Steps": true,
                "Friends and Family": false,
            },

        },
        { 
            //Eligiblity Difference: Sex Offender
            name: "Provider 2", 
            eligibilities: {
                "Within 5 Years of Incarceration": true,
                "Homeless": true,
                "Elderly": false,
                "Veteran": false,
                "30 Days Clean and Sober": false,
                "Sex Offender": false,
            },
            features: {
                "Local Hiring and Fair Minimum": false,
                "Formerly Incarcerated Leadership": true,
                "Youth Programs Available": true,
                "Voluntary": true,
                "In Custody Review": false,
            },
            categories: {
                "Community": true,
                "Education": false,
                "Employment": false,
                "Financial": true,
                "First Steps": true,
                "Friends and Family": false,
            },

        },
        { 
            //Features Difference: Local Hiring, Formerly, Voluntary
            //Categories Difference: Community, Education, Employment, Financial
            name: "Provider 3", 
            eligibilities: {
                "Within 5 Years of Incarceration": true,
                "Homeless": true,
                "Elderly": false,
                "Veteran": false,
                "30 Days Clean and Sober": false,
                "Sex Offender": true,
            },
            features: {
                "Local Hiring and Fair Minimum": true,
                "Formerly Incarcerated Leadership": false,
                "Youth Programs Available": true,
                "Voluntary": false,
                "In Custody Review": false,
            },
            categories: {
                "Community": false,
                "Education": true,
                "Employment": true,
                "Financial": false,
                "First Steps": true,
                "Friends and Family": false,
            },

        },
        { 
            //Features Difference: In Custody, Formerly
            //Categories Difference: First Steps, Financial, Education, Friends and Family
            name: "Provider 4", 
            eligibilities: {
                "Within 5 Years of Incarceration": true,
                "Homeless": true,
                "Elderly": false,
                "Veteran": false,
                "30 Days Clean and Sober": false,
                "Sex Offender": true,
            },
            features: {
                "Local Hiring and Fair Minimum": false,
                "Formerly Incarcerated Leadership": false,
                "Youth Programs Available": true,
                "Voluntary": true,
                "In Custody Review": true,
            },
            categories: {
                "Community": true,
                "Education": true,
                "Employment": false,
                "Financial": false,
                "First Steps": false,
                "Friends and Family": true,
            },

        },
    ];

    const matches = findMatches(test_user_1, providers);
    console.log(matches);
    console.log(feature_sort(matches));
}

main();