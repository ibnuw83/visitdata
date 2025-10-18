import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { users as seedUsers, destinations, categories, countries, visitData } from "@/lib/seed";

export async function POST() {
  try {
    const adminRef = adminDb.doc("users/admin-01");
    const adminDoc = await adminRef.get();

    if (adminDoc.exists) {
      return NextResponse.json({ message: "Data sudah ada, seeding dilewati." });
    }

    console.log("Memulai proses seeding data awal via API route...");
    const batch = adminDb.batch();

    // Seed users (tanpa password) - Auth harus dibuat terpisah jika diperlukan
    seedUsers.forEach((u) => {
      const { password, ...userDoc } = u;
      batch.set(adminDb.doc(`users/${userDoc.uid}`), userDoc);
    });

    // Seed destinasi
    destinations.forEach((d) => batch.set(adminDb.doc(`destinations/${d.id}`), d));

    // Seed kategori
    categories.forEach((c) => batch.set(adminDb.doc(`categories/${c.id}`), c));

    // Seed negara
    countries.forEach((c) => batch.set(adminDb.doc(`countries/${c.code}`), c));

    // Seed data kunjungan
    visitData.forEach((vd) =>
      batch.set(adminDb.doc(`destinations/${vd.destinationId}/visits/${vd.id}`), vd)
    );

    await batch.commit();

    console.log("Seeding selesai tanpa error.");
    return NextResponse.json({ message: "Data awal berhasil dimuat." });
  } catch (error: any) {
    console.error("Gagal seeding:", error);
    return NextResponse.json(
      { error: error.message || "Gagal melakukan seeding data awal" },
      { status: 500 }
    );
  }
}
