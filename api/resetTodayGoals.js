import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Firebase Admin SDKの初期化
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export async function GET(req) {
  // Authorizationヘッダーをチェック
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    snapshot.forEach(async (doc) => {
      await doc.ref.update({
        todayGoals: {
          newEntries: 0,
          auUQPoints: 0,
          serpa: 0,
          saison: 0,
          souhan: 0,
        },
      });
    });

    return NextResponse.json({ message: 'todayGoals reset successfully' });
  } catch (error) {
    console.error('Error resetting todayGoals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
