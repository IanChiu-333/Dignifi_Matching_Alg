import { initializeApp } from "firebase/app";
import { collection, getDocs } from 'firebase/firestore';

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
function userEligibilitiesMatch(userEligibilities, provider) {
    let isValid = true;
    providerEligibilities = provider.providerOnboardingInfo.generalService.eligibilityCriteria;
    for (const key in providerEligibilities) {
        //E2 - 30 Days Clean and Sober
        if (providerEligibilities[key] === "30 Days Clean and Sober") {
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }
        //E3 - Adults Only (18+)
        if (providerEligibilities[key] === "Adults Only (18+)") {
            const today = new Date();
            const dateOfBirth = userEligibilities.onboardingInfo.personalInfo.dateOfBirth.toDate();
            const difference = Math.abs(today - dateOfBirth) / (1000 * 60 * 60 * 24)
            if (difference > 6570) {
                isValid = true;
            } else {
                isValid = false;
            }
        }
        //E4 - Completed a Recovery Program - WIP
        if (providerEligibilities[key] === "Completed a Recovery Program") {
            // if (userEligibilities["Programs Accessed"]["is_recovery"] === true) {
            //     isValid = true;
            // } else {
            //     isValid = false;
            // }
            isValid = true;
        }
        //E5 - Current Custody with Plans for Reentry
        if (providerEligibilities[key] === "Current Custody with Plans for Reentry") {
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }
        //E6 - Completed a Recovery Program - WIP
        if (providerEligibilities[key] === "Completed a Recovery Program") {
            // if (userEligibilities["Programs Accessed"]["ongoing_participation"] === true) {
            //     isValid = true;
            // } else {
            //     isValid = false;
            // }
            isValid = true;
        }
        //E7 - Currently Living in Transitional Housing
        if (providerEligibilities[key] === "Currently Living in Transitional Housing") {
            const currentHousingStatus = userEligibilities.onboardingInfo.currentNeedsInfo.currentHousingStatus;
            if (currentHousingStatus === "Transitional Housing") {
                isValid = true;
            } else {
                isValid = false;
            }
        }
        //E8 - Disabled Individuals
        if (providerEligibilities[key] === "Disabled Individuals") {
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }
        //E9 - Elderly
        if (providerEligibilities[key] === "Elderly") {
            const today = new Date();
            const dateOfBirth = userEligibilities.onboardingInfo.personalInfo.dateOfBirth.toDate();
            if (today - dateOfBirth > 23725) {
                isValid = true;
            } else {
                isValid = false;
            }
        }
        //E10 - Families with Justice-Impacted Members
        if (providerEligibilities[key] === "Families with Justice-Impacted Members") {
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }
        //E11 - First 90 Days of Reentry
        if (providerEligibilities[key] === "First 90 Days of Reentry") {
            const today = new Date();
            const latestReleaseDate = userEligibilities.onboardingInfo.incarcerationInfo.latestReleaseDate.toDate();
            const difference = Math.abs(today - latestReleaseDate) / (1000 * 60 * 60 * 24);
            if (difference < 90) {
                isValid = true;
            } else {
                isValid = false;
            }
        }
        //E12 - First Time Offenders
        if (providerEligibilities[key] === "First Time Offenders") {
            const numberOfTimesIncarcerated = userEligibilities.onboardingInfo.incarcerationInfo.numberOfTimesIncarcerated;
            if (numberOfTimesIncaracerated === 1) {
                isValid = true;
            } else {
                isValid = false;
            }
        }
        //E13 - Geographic Residency
        if (providerEligibilities[key] === "Geographic Residency") {
            const userCity = userEligibilities.onboardingInfo.personalInfo.city;
            const userState = userEligibilities.onboardingInfo.personalInfo.state;
            const providerCity = provider.providerOnboardingInfo.providerDetails.city;
            const providerState = provider.providerOnboardingInfo.providerDetails.state;
            if (userCity === providerCity || userState === providerState) {
                isValid = true;
            } else {    
                isValid = false;
            }
        }
        //E14 - Homeless or At-Risk of Homelessness
        if (providerEligibilities[key] === "Homeless or At-Risk of Homelessness") {
            const currentHousingStatus = userEligibilities.onboardingInfo.currentNeedsInfo.currentHousingStatus;
            if (currentHousingStatus === "Houseing Insecure") {
                isValid = true;
            } else {
                isValid = false;
            }
        }
        //E15 - Individuals Awaiting Court Sentencing
        if (providerEligibilities[key] === "Individuals Awaiting Court Sentencing") {
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }
        //E16 - Individuals Eligible for Specific Grant Funded Programs
        if (providerEligibilities[key] === "Individuals Eligible for Specific Grant Funded Programs") {
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }
        //E17 - Individuals Enrolled in Workforce Training Programs - WIP
        if (providerEligibilities[key] === "Individuals Enrolled in Workforce Training Programs") {
            // if (userEligibilities["Programs Accessed"]["workforce_training"] === true) {
            //     isValid = true;
            // } else {
            //     isValid = false;
            // }
            isValid = true;
        }
        //E18 - Individuals Receiving Food Stamps or Government Assistance
        if (providerEligibilities[key] === "Individuals Receiving Food Stamps or Government Assistance") {
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }
        //E19 - Individuals Released to County-Specific Probation
        if (providerEligibilities[key] === "Individuals Released to County-Specific Probation") {
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }
        // E20 - Individuals on Electronic Monitoring (e.g., ankle monitors)
        if (providerEligibilities[key] === "Individuals on Electronic Monitoring") {
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E21 - Individuals on Parole or Probation - WIP; No data field for current custody status
        if (providerEligibilities[key] === "Individuals on Parole or Probation") {
            // if (userEligibilities["Current Custody Status"] === "Parole" || userEligibilities["Current Custody Status"] === "Probation") {
            //     isValid = true;
            // } else {
            //     isValid = false;
            // }
            isValid = true;
        }

        // E22 - Individuals with HIV/AIDS or Other Chronic Illnesses
        if (providerEligibilities[key] === "Individuals with HIV/AIDS or Other Chronic Illnesses") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E23 - Individuals with Housing Vouchers
        if (providerEligibilities[key] === "Individuals with Housing Vouchers") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E24 - Individuals with Mental Health Diagnoses
        if (providerEligibilities[key] === "Individuals with Mental Health Diagnoses") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E25 - Individuals with Substance Use History - WIP
        if (providerEligibilities[key] === "Individuals with Substance Use History") { 
            // if (userEligibilities["Programs Accessed"]["substance_use_recovery"] === true) {
            //     isValid = true;
            // } else {
            //     isValid = false;
            // }
            isValid = true;
        }

        // E26 - Individuals with a GED or Equivalent Education
        if (providerEligibilities[key] === "Individuals with a GED or Equivalent Education") { 
            const educationLevel = userEligibilities.onboardingInfo.currentNeedsInfo.highestLevelOfEducation;
            if (educationLevel === "GED") {
                isValid = true;
            } else {
                isValid = false;
            }
        }

        // E27 - Justice Impact People in Alameda County - WIP; No field for county
        if (providerEligibilities[key] === "Justice Impact People in Alameda County") { 
            
            // if (userEligibilities["Location"] === "Alameda County") {
            //     isValid = true;
            // } else {
            //     isValid = false;
            // }
            isValid = true;
        }

        // E28 - LGBTQ+ Identifying Individuals - WIP; No field for identity
        if (providerEligibilities[key] === "LGBTQ+ Identifying Individuals") { 
            // if (userEligibilities["Identify"] === true) {
            //     isValid = true;
            // } else {
            //     isValid = false;
            // }
            isValid = true;
        }

        // E29 - Location - Same as 13?
        // if (providerEligibilities[key] === "Location") {

        // }

        // E30 - Low-Income or Below Poverty Threshold
        if (providerEligibilities[key] === "Low-Income or Below Poverty Threshold") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E31 - Members of Racial/Ethnic Minority Groups
        if (providerEligibilities[key] === "Members of Racial/Ethnic Minority Groups") {
            const ethnicity = userEligibilities.onboardingInfo.personalInfo.ethnicity;
            if (ethnicity !== "white") {
                isValid = true;
            } else {
                isValid = false;
            }
        }

        // E32 - Men Only
        if (providerEligibilities[key] === "Men Only") {
            const gender = userEligibilities.onboardingInfo.personalInfo.gender;
            if (gender === "Male") {
                isValid = true;
            } else {
                isValid = false;
            }
        }

        // E33 - Minimum 30 Days Clean and Sober
        if (providerEligibilities[key] === "Minimum 30 Days Clean and Sober") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E34 - Must Be Employed or Actively Job Seeking
        if (providerEligibilities[key] === "Must Be Employed or Actively Job Seeking") {
            const employmentStatus = userEligibilities.onboardingInfo.currentNeedsInfo.currentEmploymentStatus;
            if (employmentStatus === "Currently Employed" || employmentStatus === "Career Desire") {
                isValid = true;
            } else {
                isValid = false; 
            }
        }

        // E35 - Must Be Enrolled in or Completed Educational Program - WIP
        if (providerEligibilities[key] === "Must Be Enrolled in or Completed Educational Program") {
            // if (userEligibilities["Programs Accessed"]["education"] === true || userEligibilities["Education Level"] !== "None") {
            //     isValid = true;
            // } else {
            //     isValid = false;
            // }
            isValid = true; 
        }

        // E36 - Must Be Formerly Incarcerated
        if (providerEligibilities[key] === "Must Be Formerly Incarcerated") {
            const numberOfTimesIncarcerated = userEligibilities.onboardingInfo.incarcerationInfo.numberOfTimesIncarcerated;
            if (numberOfTimesIncarcerated > 0) {
                isValid = true;
            } else {
                isValid = false;
            }
        }

        // E37 - Must Have Dependents (Parents Only)
        if (providerEligibilities[key] === "Must Have Dependents (Parents Only)") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E38 - Must Participate in Case Management Services
        if (providerEligibilities[key] === "Must Participate in Case Management Services") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E39 - Must Pay a Participation Fee (Sliding Scale)
        if (providerEligibilities[key] === "Must Pay a Participation Fee (Sliding Scale)") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E40 - Must be homeless
        if (providerEligibilities[key] === "Must be homeless") {
            const currentHousingStatus = userEligibilities.onboardingInfo.currentNeedsInfo.currentHousingStatus;
            if (currentHousingStatus === "Housing Insecure") {
                isValid = true;
            } else {
                isValid = false;
            } 
        }

        // E41 - No History of Violent Crimes
        if (providerEligibilities[key] === "No History of Violent Crimes") {
            const offenceType = userEligibilities.onboardingInfo.incarcerationInfo.latestOffenceType;
            if (!offenceType.includes("Violent")) {
                isValid = true;
            } else {
                isValid = false;
            } 
        }

        // E42 - No Registered Sex Offenders; // E43 - No Sexual Criminal Convictions; // E44 - No Sexual Offenses or Registered Sex Offenders
        if (providerEligibilities[key] === "No Registered Sex Offenders" || providerEligibilities[key] === "No Sexual Criminal Convictions" || providerEligibilities[key] === "No Sexual Offenses or Registered Sex Offenders") {
            const offenceType = userEligibilities.onboardingInfo.incarcerationInfo.latestOffenceType;
            if (!offenceType.includes("Sexual")) {
                isValid = true;
            } else {
                isValid = false;
            } 
        }

        // E45 - Parents Reunifying with Their Children
        if (providerEligibilities[key] === "Parents Reunifying with Their Children") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E46 - Programs Accessed - WIP
        if (providerEligibilities[key] === "Programs Accessed") {
            // if (userEligibilities["Programs Accessed"].length !== 0) {
            //     isValid = true;
            // } else {
            //     isValid = false;
            // } 
            isValid = true;
        }

        // E47 - Referral Required from Housing Coordinator
        if (providerEligibilities[key] === "Referral Required from Housing Coordinator") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E48 - Referral Required: Alameda County Probation
        if (providerEligibilities[key] === "Referral Required: Alameda County Probation") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E49 - Referral from Social Services (Specify Agency)
        if (providerEligibilities[key] === "Referral from Social Services (Specify Agency)") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E50 - Senior Citizens (60+)
        if (providerEligibilities[key] === "Senior Citizens (60+)") {
            const today = new Date();
            const dateOfBirth = userEligibilities.onboardingInfo.personalInfo.dateOfBirth.toDate();
            if (today - dateOfBirth > 23725) {
                isValid = true;
            } else {
                isValid = false;
            }
        }

        // E51 - Specific Criminal Convictions Allowed/Disallowed (e.g., financial crimes) - WIP data not logged
        if (providerEligibilities[key] === "Specific Criminal Convictions Allowed/Disallowed") {
            // if (!providerEligibilities["Specific Criminal Convictions Disallowed"].includes(userEligibilities["Type of Offense"])) {
            //     isValid = true;
            // } else {
            //     isValid = false;
            // }
            isValid = true;
        }

        // E52 - Survivors of Domestic Violence
        if (providerEligibilities[key] === "Survivors of Domestic Violence") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E53 - Survivors of Human Trafficking
        if (providerEligibilities[key] === "Survivors of Human Trafficking") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E54 - Undocumented Individuals or Individuals with Immigration Challenges
        if (providerEligibilities[key] === "Undocumented Individuals or Individuals with Immigration Challenges") { 
            isValid = true;
            //Logic Needs to be replaced
            console.log("Currently no data available to check");
        }

        // E55 - Veterans Only
        if (providerEligibilities[key] === "Veterans Only") {
            const veteran = userEligibilities.onboardingInfo.personalInfo.veteranStatus;
            if (veteran === "Yes") {
                isValid = true;
            } else {
                isValid = false; 
            }
        }

        // E56 - Within 1 Year of Incarceration
        if (providerEligibilities[key] === "Within 1 Year of Incarceration") {
            const today = new Date();
            const latestReleaseDate = userEligibilities.onboardingInfo.incarcerationInfo.latestReleaseDate.toDate();
            const difference = Math.abs(today - latestReleaseDate) / (1000 * 60 * 60 * 24);
            if (difference < 365) {
                isValid = true;
            } else {
                isValid = false;
            } 
        }

        // E57 - Within 3 Years of Incarceration
        if (providerEligibilities[key] === "Within 3 Years of Incarceration") {
            const today = new Date();
            const latestReleaseDate = userEligibilities.onboardingInfo.incarcerationInfo.latestReleaseDate.toDate();
            const difference = Math.abs(today - latestReleaseDate) / (1000 * 60 * 60 * 24);
            if (difference < 1095) {
                isValid = true;
            } else {
                isValid = false;
            } 
        }

        // E58 - Within 5 Years of Incarceration
        if (providerEligibilities[key] === "Within 5 Years of Incarceration") {
            const today = new Date();
            const latestReleaseDate = userEligibilities.onboardingInfo.incarcerationInfo.latestReleaseDate.toDate();
            const difference = Math.abs(today - latestReleaseDate) / (1000 * 60 * 60 * 24);
            if (difference < 1825) {
                isValid = true;
            } else {
                isValid = false;
            } 
        }

        // E59 - Within 6 Months of Incarceration
        if (providerEligibilities[key] === "Within 6 Months of Incarceration") {
            const today = new Date();
            const latestReleaseDate = userEligibilities.onboardingInfo.incarcerationInfo.latestReleaseDate.toDate();
            const difference = Math.abs(today - latestReleaseDate) / (1000 * 60 * 60 * 24);
            if (difference < 180) {
                isValid = true;
            } else {
                isValid = false;
            } 
        }

        // E60 - Within 6 months of release to Alameda County - WIP, no field for county
        if (providerEligibilities[key] === "Within 6 months of release to Alameda County") { 
            // const today = new Date();
            // const latestReleaseDate = userEligibilities.onboardingInfo.incarcerationInfo.latestReleaseDate.toDate();
            // const difference = Math.abs(today - latestReleaseDate) / (1000 * 60 * 60 * 24);
            // if (difference < 180 && userEligibilities["Location"] === "Alameda County") {
            //     isValid = true;
            // } else {
            //     isValid = false;
            // }
            isValid = true;
        }

        // E61 - Women Only
        if (providerEligibilities[key] === "Women Only") {
            const gender = userEligibilities.onboardingInfo.personalInfo.gender;
            if (gender === "Female") {
                isValid = true;
            } else {
                isValid = false;
            } 
        }

        // E62 - Youth Only (12-17)
        if (providerEligibilities[key] === "Youth Only (12-17)") {
            const today = new Date();
            const dateOfBirth = userEligibilities.onboardingInfo.personalInfo.dateOfBirth.toDate();
            if (today - dateOfBirth > 4380 && today - dateOfBirth < 6570) {
                isValid = true;
            } else {
                isValid = false;
            }  
        }
        if (isValid === false) {
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