
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
      return {error: "Failed to set custom claim."};
    }
  });
