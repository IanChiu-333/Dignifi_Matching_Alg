//Finds matches by accepting two JSON objects for user and provider attributes
function findMatches(user, providers) {
    let matches = new Object();
    let invalids = [];
    
    //Not a fan of this triple for loop - think of something to make more efficient
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

//Finds matching eligibilities - only returns exact matches
function eligibiiltyMatch(userEligibilities, providerEligibilities) {
    for (const key in userEligibilities) {
        if (userEligibilities[key] !== providerEligibilities[key]) {
            return false;
        }
    }
    return true;
}

//Finds features and category matches - Just returns the matching ones
function features_and_categories_match(user_f_or_c, provider_f_or_c) {
    let matches = {};

    for (const key in user_f_or_c) {
        if (user_f_or_c[key] === provider_f_or_c[key]) {
            matches[key] = user_f_or_c[key];
        }
    }

    return matches;
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
            //Features Difference: In Custody, Formerly, Voluntary
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
                "Voluntary": false,
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
}

main();