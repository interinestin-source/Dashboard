// import { useEffect, useState, useRef } from "react";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   addDoc,
//   query,
//   orderBy,
//   onSnapshot,
//   updateDoc,
//   doc,
// } from "firebase/firestore";
// import { useAuth } from "@/context/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Send } from "lucide-react";
//  import { deleteDoc } from "firebase/firestore";
// interface EnquiryChatProps {
//   enquiryId: string;
//   status: string;
//   userRole?: "buyer" | "supplier";
// }

// export default function EnquiryChat({
//   enquiryId,
//   status,
//   userRole = "buyer",
// }: EnquiryChatProps) {
//   const { uid } = useAuth();
//   const [messages, setMessages] = useState<any[]>([]);
//   const [input, setInput] = useState("");
//   const messagesEndRef = useRef<HTMLDivElement>(null);


// // ...existing imports...

// useEffect(() => {
//   const q = query(
//     collection(db, "enquiryChats", enquiryId, "messages"),
//     orderBy("createdAt", "asc")
//   );
//   const unsub = onSnapshot(q, async (snap) => {
//     const now = Date.now();
//     const THIRTY_DAYS =  5 * 60 * 1000;
//     //30 * 24 * 60 * 60 * 1000;
//     const validMessages: any[] = [];
//     await Promise.all(
//       snap.docs.map(async (docSnap) => {
//         const data = docSnap.data();
//         const createdAt = data.createdAt?.toDate?.() || data.createdAt;
//         if (createdAt && now - new Date(createdAt).getTime() > THIRTY_DAYS) {
//           // Delete from Firestore
//           await deleteDoc(docSnap.ref);
//         } else {
//           validMessages.push(data);
//         }
//       })
//     );
//     setMessages(validMessages);
//   });
//   return () => unsub();
// }, [enquiryId]);
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   async function sendMessage(e: React.FormEvent) {
//     e.preventDefault();
//     if (!input.trim()) return;
//     await addDoc(collection(db, "enquiryChats", enquiryId, "messages"), {
//       senderUid: uid,
//       senderRole: userRole,
//       text: input,
//       createdAt: new Date(),
//     });
//     setInput("");
//     await updateDoc(doc(db, "enquiry", enquiryId), { status: "pending" });
//   }

//   return (
//     <div className="border rounded-xl p-2 bg-white shadow-sm flex flex-col h-[400px] max-h-[80vh]">
//    <div className="text-xs text-gray-500 mb-2 text-center">
//   Note: Messages will disappear after 30 days.
// </div>
//       <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg px-2 py-3 space-y-2 transition-all">
       
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`flex items-end ${
//               msg.senderUid === uid ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm transition-all
//                 ${
//                   msg.senderUid === uid
//                     ? "bg-blue-600 text-white rounded-br-none"
//                     : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
//                 }`}
//             >
//               <div className="text-xs font-semibold mb-1">
//                 {msg.senderUid === uid
//                   ? "You"
//                   : msg.senderRole === "supplier"
//                   ? "Supplier"
//                   : "Buyer"}
//               </div>
//               <div className="text-sm break-words">{msg.text}</div>
//               <div className="text-[10px] text-gray-400 mt-1 text-right">
//                 {msg.createdAt?.toDate?.()
//         ? `${msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${msg.createdAt.toDate().toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}`
//     : ""}
//               </div>
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>
//       <form onSubmit={sendMessage} className="flex gap-2 mt-3">
//         <input
//           className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type your message..."
//           autoComplete="off"
//         />
//         <Button
//           type="submit"
//           size="sm"
//           className="rounded-full px-3 py-2 flex items-center gap-1"
//         >
//           <Send className="h-4 w-4" />
//         </Button>
//       </form>
//     </div>
//   );
// }
