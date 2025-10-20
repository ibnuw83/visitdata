
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

// HTTP-callable function to get all necessary data for the public dashboard
exports.getPublicDashboardData = functions.https.onCall(async (data, context) => {
  const year = data.year || new Date().getFullYear();

  try {
    // 1. Get all active destinations
    const destinationsSnapshot = await db.collection("destinations").where("status", "==", "aktif").get();
    const activeDestinations = destinationsSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    const activeDestinationIds = new Set(activeDestinations.map((d) => d.id));


    if (activeDestinationIds.size === 0) {
        return {
            activeDestinations: [],
            allVisitDataForYear: [],
            availableYears: [new Date().getFullYear().toString()],
        };
    }

    // 2. Fetch all visit data for the given year for active destinations
    // This is more robust than a single collectionGroup query if indexes are an issue.
    const visitPromises = [];
    for (const destId of activeDestinationIds) {
        visitPromises.push(db.collection("destinations").doc(destId).collection("visits").where("year", "==", year).get());
    }

    const visitSnapshots = await Promise.all(visitPromises);
    const allVisitDataForYear = visitSnapshots.flatMap((snapshot) =>
        snapshot.docs.map((doc) => doc.data())
    );

    // 3. Determine available years from all visits in the database
    // To keep this function performant, we'll construct the list on the client.
    // A simplified year list is better than a failing function.
    const currentYear = new Date().getFullYear();
    const yearsSet = new Set<string>();
    allVisitDataForYear.forEach((d: any) => yearsSet.add(d.year.toString()));
    yearsSet.add(currentYear.toString());
    const availableYears = Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));


    return {
      activeDestinations,
      allVisitDataForYear,
      availableYears,
    };
  } catch (error) {
    functions.logger.error("Error in getPublicDashboardData:", error);
    // Throwing an HttpsError is the standard way to return errors to the client.
    throw new functions.https.HttpsError("internal", "Gagal mengambil data dasbor publik.", error);
  }
});
