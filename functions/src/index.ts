
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Callable function to get public dashboard data
export const getPublicDashboardData = functions.https.onCall(
  async (data, context) => {
    // This function is public, so we don't check for auth (context.auth)
    const year = data.year || new Date().getFullYear();

    try {
      // 1. Get all active destinations
      const destinationsSnapshot = await db
        .collection("destinations")
        .where("status", "==", "aktif")
        .get();
      
      const destinations = destinationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const activeDestinationIds = new Set(destinations.map(d => d.id));

      // 2. Get all visit data from all destinations using a collection group query
      const allVisitsSnapshot = await db.collectionGroup("visits").where("year", "==", year).get();
      
      // 3. Filter the visits to only include those from active destinations
      const allVisitData = allVisitsSnapshot.docs
        .map(doc => doc.data())
        .filter(visit => activeDestinationIds.has(visit.destinationId));
        
      // 4. Determine available years from ALL visits, not just the current year's
      const allYearsSnapshot = await db.collectionGroup("visits").select('year').get();
      const yearsSet = new Set(
        allYearsSnapshot.docs.map((doc) => doc.data().year.toString())
      );
      yearsSet.add(new Date().getFullYear().toString()); // Always include the current year
      const availableYears = Array.from(yearsSet).sort(
        (a, b) => parseInt(b) - parseInt(a)
      );
      
      return {
        destinations,
        allVisitData,
        availableYears,
      };

    } catch (error) {
      functions.logger.error("Error fetching public dashboard data:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Tidak dapat mengambil data dasbor publik. Silakan coba lagi nanti.",
        (error as Error).message
      );
    }
  }
);


// Cloud Function to sync user role to custom claims
exports.syncUserRole = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data();
    const oldUserData = change.before.data();

    // Check if the 'role' field has changed
    if (newUserData.role === oldUserData.role) {
      functions.logger.log(
        `Role for user ${context.params.userId} is unchanged. No action taken.`
      );
      return null;
    }

    const userId = context.params.userId;
    const newRole = newUserData.role;

    // The role must be 'admin' or 'pengelola'
    if (!["admin", "pengelola"].includes(newRole)) {
      functions.logger.warn(
        `Invalid role "${newRole}" for user ${userId}. Skipping claim update.`
      );
      return null;
    }

    try {
      // Set custom claims for the user
      await admin.auth().setCustomUserClaims(userId, {role: newRole});
      functions.logger.log(
        `Successfully set custom claim for user ${userId} to role: ${newRole}`
      );
      return {result: `Custom claim for ${userId} set to ${newRole}`};
    } catch (error) {
      functions.logger.error(
        `Error setting custom claim for user ${userId}:`,
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Failed to set custom claim."
      );
    }
  });

// Function to set admin custom claim on user creation if they are the first user
exports.setAdminClaimOnFirstUser = functions.auth.user().onCreate(async (user) => {
    const users = await admin.auth().listUsers(1);
    if (users.users.length === 1) {
        // This is the first user, make them an admin.
        await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
        functions.logger.log(`Admin claim set for the first user: ${user.email}`);

        // Also update their Firestore document.
        const userRef = db.collection('users').doc(user.uid);
        try {
            await userRef.set({ role: 'admin' }, { merge: true });
            functions.logger.log(`Firestore role updated to admin for user: ${user.email}`);
        } catch (error) {
            functions.logger.error(`Failed to update Firestore role for first user: ${user.email}`, error);
            // Even if Firestore update fails, the claim is the most important part.
        }
    }
});
