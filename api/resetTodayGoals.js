import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
    throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
  }
}

const db = admin.firestore();

export async function GET(req) {
  console.log('resetTodayGoals endpoint called'); // ログを追加
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
