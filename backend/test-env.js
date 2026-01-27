require('dotenv').config();

console.log('Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

if (process.env.MONGODB_URI) {
  console.log('MONGODB_URI value:', process.env.MONGODB_URI);
}