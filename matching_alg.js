//This needs to be updated to use our firebase database and its format
//Ideally we would get a userId and return a list of parameters for that user(eligibilities)

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

exports.getProviders = functions.https.onRequest(async (req, res) => {
    try {
        //Some code to return a JSON file of providers and their attributes
    } catch (error) {
      res.status(500).send("Error retrieving database: " + error);
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

//Find Matches function - takes in a list of userTags and a JSON file of providers
//Returns a JSON file of providers that contain userTags
function findMatches(userTags, providers) {
    let matches = {};

    providers.forEach(provider => {
        let matchingTags = provider.tags.filter(tag => userTags.includes(tag));
        if (matchingTags.length > 0) {
        matches[provider.name] = matchingTags;
        }
    });

    return matches;
}


//For local alg testing
function main() {
    const userTags = ["tag1", "tag2", "tag3"];
    const providers = [
        { name: "Provider1", tags: ["tag1", "tag4"] },
        { name: "Provider2", tags: ["tag2", "tag5"] },
        { name: "Provider3", tags: ["tag3", "tag6"] },
        { name: "Provider4", tags: ["tag7", "tag8"] }
    ];

    const matches = findMatches(userTags, providers);
    console.log(matches);
}

main();