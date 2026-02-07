
// Este arquivo é mantido apenas para compatibilidade, mas a inicialização correta
// ocorre em src/firebase/index.ts. Redirecionamos para usar a config oficial.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
