const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { setGlobalOptions } = require("firebase-functions/v2");

admin.initializeApp();

// Встановлюємо глобальний регіон для всіх функцій v2
setGlobalOptions({ region: 'europe-west3' });

exports.syncuseremail = onDocumentUpdated("users/{uid}", async (event) => {
    const newValue = event.data.after.data();
    const previousValue = event.data.before.data();
    const uid = event.params.uid;

    if (newValue.email !== previousValue.email) {
        console.log(`Syncing email for UID: ${uid} | ${previousValue.email} -> ${newValue.email}`);
        try {
            await admin.auth().updateUser(uid, {
                email: newValue.email,
            });
            console.log(`Successfully updated Auth for UID: ${uid}`);
        } catch (error) {
            console.error(`Error updating Auth for UID: ${uid}`, error);
        }
    }
});
