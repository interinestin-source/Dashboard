// import { db } from "@/lib/firebase";
// import {
//   collection,
//   deleteDoc,
//   doc,
//   getDocs,
//   orderBy,
//   query,
//   serverTimestamp,
//   setDoc,
// } from "firebase/firestore";

// export async function recordRecentView(
//   uid: string,
//   product: {
//     id: string;
//     name: string;
//     supplier?: string | null;
//     price?: number | null;
//     image?: string | null;
//   },
//   maxKeep = 20
// ) {
//   const ref = doc(db, "users", uid, "recentViews", product.id);
//   await setDoc(
//     ref,
//     {
//       productId: product.id,
//       name: product.name,
//       supplier: product.supplier ?? null,
//       price: product.price ?? null,
//       image: product.image ?? null,
//       viewedAt: serverTimestamp(),
//     },
//     { merge: true }
//   );

//   // Prune older entries beyond maxKeep
//   const colRef = collection(db, "users", uid, "recentViews");
//   const q = query(colRef, orderBy("viewedAt", "desc"));
//   const snap = await getDocs(q);
//   const toDelete = snap.docs.slice(maxKeep);
//   await Promise.all(toDelete.map((d) => deleteDoc(d.ref)));
// }