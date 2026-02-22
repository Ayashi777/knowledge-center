const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const isValidEmail = (email) => typeof email === "string" && email.includes("@") && email.trim().length > 3;

const isAdminCaller = async (uid) => {
  const snap = await admin.firestore().doc(`users/${uid}`).get();
  if (!snap.exists) return false;
  const data = snap.data() || {};
  return data.role === "admin";
};

const syncUserEmailHandler = async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;
    const nextEmail = typeof after.email === "string" ? after.email.trim() : "";

    if (before.email === after.email) return null;
    if (!isValidEmail(nextEmail)) {
      console.warn(`Skipped invalid email update for user ${userId}:`, after.email);
      return null;
    }

    try {
      await admin.auth().updateUser(userId, { email: nextEmail });
      console.log(`Email updated for user ${userId}: ${nextEmail}`);
      return null;
    } catch (error) {
      console.error(`Failed to update email for user ${userId}:`, error);
      return null;
    }
};

const adminUpdateUserEmailHandler = async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  const callerUid = context.auth.uid;
  const allowed = await isAdminCaller(callerUid);

  if (!allowed) {
    throw new functions.https.HttpsError("permission-denied", "Admin role required.");
  }

  const uid = typeof data?.uid === "string" ? data.uid.trim() : "";
  const email = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";

  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "uid is required.");
  }

  if (!isValidEmail(email)) {
    throw new functions.https.HttpsError("invalid-argument", "Valid email is required.");
  }

  await admin.auth().updateUser(uid, { email });
  await admin.firestore().doc(`users/${uid}`).set({ email }, { merge: true });

  return { success: true };
};

exports.syncUserEmail = functions.region('europe-west3').firestore
  .document("users/{userId}")
  .onUpdate(syncUserEmailHandler);

exports.adminUpdateUserEmail = functions.region("europe-west3").https.onCall(adminUpdateUserEmailHandler);
