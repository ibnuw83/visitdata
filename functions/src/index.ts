
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


exports.getPublicDashboardData = functions.https.onCall(async (data, context) => {
  const year = data.year || new Date().getFullYear();

  try {
    // 1. Get all active destinations
    const activeDestinationsSnapshot = await db.collection("destinations").where("status", "==", "aktif").get();
    const activeDestinations = activeDestinationsSnapshot.docs.map((doc) => doc.data());
    const activeDestinationIds = activeDestinations.map((dest) => dest.id);

    if (activeDestinationIds.length === 0) {
      return {
        totalVisitors: 0,
        totalWisnus: 0,
        totalWisman: 0,
        activeDestinations: [],
        visitData: [],
        availableYears: [new Date().getFullYear().toString()],
      };
    }

    // 2. Fetch all visit data for the selected year from active destinations
    // Firestore 'in' queries are limited to 10 items. We need to batch if necessary.
    const visitData: any[] = [];
    const allYearsSet = new Set<string>();
    
    // Batching the 'in' query
    const BATCH_SIZE = 10;
    for (let i = 0; i < activeDestinationIds.length; i += BATCH_SIZE) {
        const batchIds = activeDestinationIds.slice(i, i + BATCH_SIZE);
        const visitsSnapshot = await db.collectionGroup("visits")
          .where("year", "==", year)
          .where("destinationId", "in", batchIds)
          .get();

        visitsSnapshot.docs.forEach((doc) => {
            visitData.push(doc.data());
        });
    }

    // 3. Fetch all available years from the visits collection group
    // This is an expensive query, so we do it last and with care.
    const allYearsSnapshot = await db.collectionGroup("visits").select("year").get();
    allYearsSnapshot.forEach((doc) => {
      const visit = doc.data();
      if(visit.year) allYearsSet.add(visit.year.toString());
    });
    allYearsSet.add(new Date().getFullYear().toString());

    // 4. Calculate totals
    const totalVisitors = visitData.reduce((sum, item) => sum + (item.totalVisitors || 0), 0);
    const totalWisnus = visitData.reduce((sum, item) => sum + (item.wisnus || 0), 0);
    const totalWisman = visitData.reduce((sum, item) => sum + (item.wisman || 0), 0);

    return {
      totalVisitors,
      totalWisnus,
      totalWisman,
      activeDestinations,
      visitData,
      availableYears: Array.from(allYearsSet).sort((a, b) => parseInt(b) - parseInt(a)),
    };
  } catch (error) {
    functions.logger.error("Error in getPublicDashboardData:", error);
    throw new functions.https.HttpsError("internal", "Gagal mengambil data dasbor.", error);
  }
});
