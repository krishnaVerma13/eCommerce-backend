import { connect as _connect } from 'mongoose';
import dotenv from 'dotenv';

const connectDB = async ()=>{
    
    const uri = process.env.DB_CONNECTION_STR
    try {
        const connect = await _connect(uri);
        console.log("Database connected", connect.connection.host, connect.connection.name);
        // console.log(process.env.KRIS);
        
    } catch (error) {
        console.log(error);
        process.exit(1)
        
    }
}

export default connectDB;