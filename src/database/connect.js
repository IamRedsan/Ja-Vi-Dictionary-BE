import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = 'mongodb://localhost:27017/JVDictionary';

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;