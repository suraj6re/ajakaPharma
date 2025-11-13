// Script to create admin account in Firebase Authentication
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Your Firebase config (from your existing setup)
const firebaseConfig = {
  apiKey: "AIzaSyDRMGv_91Bg3jixdAf49_5fPqm5KpC2SPk",
  authDomain: "ajaka-2dcde.firebaseapp.com",
  projectId: "ajaka-2dcde",
  storageBucket: "ajaka-2dcde.firebasestorage.app",
  messagingSenderId: "1055453944469",
  appId: "1:1055453944469:web:0ede3fe4f92d331be0599c",
  measurementId: "G-43CFPFJ0MP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminAccount() {
  try {
    // Admin credentials
    const adminEmail = 'suraj6re@gmail.com';
    const adminPassword = 'Admin@123456'; // Change this to your preferred password
    
    console.log('Creating admin account...');
    
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('Admin user created in Authentication:', user.uid);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: 'Admin User',
      email: adminEmail,
      role: 'Admin',
      createdAt: new Date(),
      first_login: false
    });
    
    console.log('Admin user document created in Firestore');
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Please change the password after first login');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ Admin account already exists!');
      console.log('📧 Email: suraj6re@gmail.com');
      console.log('🔑 Try password: Admin@123456');
    } else {
      console.error('❌ Error creating admin account:', error.message);
    }
  }
}

createAdminAccount();