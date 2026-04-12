import mongoose from "mongoose";

async function main() {
   await mongoose.connect(process.env.MONGODB_URI)
   
}

export default main;
