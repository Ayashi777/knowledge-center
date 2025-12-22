const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const syncUserEmailHandler = async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;

    if (before.email === after.email) return null;

    try {
      await admin.auth().updateUser(userId, { email: after.email });
      console.log(`Email updated for user ${userId}: ${after.email}`);
      return null;
    } catch (error) {
      console.error(`Failed to update email for user ${userId}:`, error);
      return null;
    }
};

exports.syncUserEmail = functions.firestore
  .document("users/{userId}")
  .onUpdate(syncUserEmailHandler);

exports.syncuseremail = exports.syncUserEmail;
