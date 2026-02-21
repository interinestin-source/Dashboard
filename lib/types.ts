// export interface User {
//   id: string
//   email: string
//   companyName: string
//   contactPerson: string
//   phone: string
//   address: string
//   city: string
//   state: string
//   pincode: string
//   gstNumber: string
//   userType: "supplier" | "buyer" | "admin"
//   businessType: string
//   description?: string
//   website?: string
//   establishedYear?: string
//   employeeCount?: string
//   isVerified: boolean
//   createdAt: string
   
// }

// export interface Product {
//   id: string
//   name: string
//   brand: string
//   model?: string
//   description: string
//   category: string
//   price: number
//   minOrderQuantity: number
//   stock: number
//   warranty?: string
//   specifications?: string
//   tags: string[]
//   images: string[]
//   supplierId: string
//   supplier: {
//     id: string
//     name: string
//     contactPerson: string
//     location: string
//     rating: number
//     reviews: number
//     phone: string
//     email: string
//   }
//   status: "pending" | "approved" | "rejected"
//   createdAt: string
//   updatedAt: string
// }

// export interface Enquiry {
//   id: string
//   productId: string
//   productName: string
//   buyerId: string
//   buyerName: string
//   buyerCompany: string
//   buyerEmail: string
//   buyerPhone: string
//   buyerLocation: string
//   supplierId: string
//   quantity: number
//   message: string
//   urgency: "low" | "medium" | "high"
//   status: "new" | "replied" | "quoted" | "closed"
//   createdAt: string
//   updatedAt: string
// }

// export const ELECTRICAL_CATEGORIES = [
//   "Electrical Goods, Equipment & Supplies",
//   "LED Products",
//   "Control Panel Boards",
//   "Wires/Cables & Accessories",
//   "Electronic Products & Components",
//   "Mobile Phones, Accessories & Parts",
//   "Bulbs & Tubelights",
//   "Electric Motors & Engines",
//   "Electrical / Lighting Products & Components",
//   "Cables/Cable Accessories & Conductors",
//   "Switches",
// ] as const

// export const INDIAN_STATES = [
//   "Andhra Pradesh",
//   "Arunachal Pradesh",
//   "Assam",
//   "Bihar",
//   "Chhattisgarh",
//   "Goa",
//   "Gujarat",
//   "Haryana",
//   "Himachal Pradesh",
//   "Jharkhand",
//   "Karnataka",
//   "Kerala",
//   "Madhya Pradesh",
//   "Maharashtra",
//   "Manipur",
//   "Meghalaya",
//   "Mizoram",
//   "Nagaland",
//   "Odisha",
//   "Punjab",
//   "Rajasthan",
//   "Sikkim",
//   "Tamil Nadu",
//   "Telangana",
//   "Tripura",
//   "Uttar Pradesh",
//   "Uttarakhand",
//   "West Bengal",
//   "Delhi",
//   "Jammu and Kashmir",
//   "Ladakh",
// ] as const


// export interface EstimateItem {
//   id: string;
//   product: string;
//   description: string;
//   quantity: number;
//   unitPrice: number;
//   total: number;
// }

// export interface Estimate {
//   uid: string;
//   id: string;
//   EstimateNumber: string;
//   EstimateDate: string;
//   quantity: number;
//   unitPrice: number;
//   taxRate: number;
//   bankName: string;
//   accountName: string;
//   subtotal: number;
//   accountNumber: string;
//   routingNumber: string;
//   ifscCode: string;
//   total?: number;
//   status?: string;
//   validUntil?: string;
//   client?: { name?: string };
//   buyerUid?: string; 
//   supplierUid?: string;
//   buyerName?: string;
// productName?: string; 
// EstimateSignature?: string;
// }



// export interface InvoiceItem {
//   id: string;
//   product: string;
//   description: string;
//   quantity: number;
//   unitPrice: number;
//   total: number;
// }

// export interface Invoice {
//   termsAndConditions?: string
//   sourcePONumber?: (arg0: string, arg1: string, sourcePONumber: any) => import("@firebase/firestore").QueryConstraint
//   sourceEstimateId?: string
//   enquiryId?: any
//   buyerUid?: any
//   supplierUid?: any
//   id: string;
//   invoiceNumber: string;
//   buyer?: any;
//   supplier?: any;
//   // buyer: {
//   //   name: string;
//   //   email: string;
//   //   address: string;
//   //   phone: string;
//   // };
// productName: string;
// quantity: number;
// taxRate: number;
//   unitPrice: number;
//   createdAt: string;
//   subtotal: number;
//   tax: number;
//   total: number;
//   status: 'paid' | 'pending' | 'overdue';
//   issueDate: string;
//   dueDate: string;
//   bankName: string;
//   accountName: string;
//   accountNumber: string;
//   routingNumber: string;
//   ifscCode: string;
// }

// export interface PurchaseOrder {
//   createdAtNum: number
//   createdAtNum: number
//   termsAndConditions: string
//   unitPrice: any
//   negotiatedAmount: any
//   total: number
//   sourceEstimateId: string | undefined
//   id: string;
//   PONumber?: string;
//   PODate?: string;
//   buyerUid?: string;
//   supplierUid?: string;
//   productName?: string;
//   quantity?: number;
//   subtotal?: number;
//   taxAmount?: number;
//   taxRate?: number;
//   status?: string;
//   enquiryId?: string;
// };


