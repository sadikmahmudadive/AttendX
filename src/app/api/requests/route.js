import admin from "firebase-admin";

if (!admin.apps.length) {
  // initialize with service account credentials from env
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

function generatePIN() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pin = "";
  const arr = new Uint32Array(6);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 6; i++) pin += chars[arr[i] % chars.length];
  return pin;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, message } = body;
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }
    const pin = generatePIN();
    const docRef = await db.collection("requests").add({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      pin,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return new Response(JSON.stringify({ ok: true, pin }), { status: 200 });
  } catch (err) {
    console.error("Request API error", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
