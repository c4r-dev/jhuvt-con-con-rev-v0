import { mongoose } from 'mongoose'
const MONGODB_URI =
  'mongodb+srv://c4rdfischer4623:df4623DF!@serverlessaws.onx2ah0.mongodb.net/c4r?retryWrites=true&w=majority&appName=ServerlessAWS'
const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB.')
  } catch (error) {
    console.log(error)
  }
}

export default connectMongoDB
