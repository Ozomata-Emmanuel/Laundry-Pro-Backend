import mongoose from 'mongoose';

const connect_db = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27018/laundry');
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('Error in MongoDB connection:', error);
  }
};

export default connect_db;