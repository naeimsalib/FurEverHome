/**
 * This Is a script that adds pets to any user in the database
 * To add pets just modify how many pets you want to add in the 'limit' variable
 * Also update the email of the user you want to assign the pets to
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Pet = require('./models/pet'); // Import your Pet model
const User = require('./models/user'); // Import your User model
const petLimits = 5; // Number of pets to add
const email = 'AdoptYourPet@AnimalShelter.com';
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// Petfinder API credentials
const API_KEY = process.env.PETFINDER_API_KEY;
const API_SECRET = process.env.PETFINDER_API_SECRET;

async function getAccessToken() {
  const response = await axios.post(
    'https://api.petfinder.com/v2/oauth2/token',
    {
      grant_type: 'client_credentials',
      client_id: API_KEY,
      client_secret: API_SECRET,
    }
  );
  return response.data.access_token;
}

async function fetchPets(accessToken, limit = petLimits) {
  const response = await axios.get('https://api.petfinder.com/v2/animals', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      limit: limit,
    },
  });
  return response.data.animals;
}

function mapAgeToNumber(age) {
  switch (age) {
    case 'Baby':
      return 0;
    case 'Young':
      return 1;
    case 'Adult':
      return 2;
    case 'Senior':
      return 3;
    default:
      return null;
  }
}

async function addPetsToDatabase() {
  const accessToken = await getAccessToken();
  const pets = await fetchPets(accessToken);

  // Fetch the user to assign as the owner
  const user = await User.findOne({ email }); // Replace with Email of User/account to add the pets to

  if (!user) {
    console.error('User not found');
    return;
  }

  for (const pet of pets) {
    const newPet = new Pet({
      name: pet.name,
      breed: pet.breeds.primary,
      type: pet.type,
      age: mapAgeToNumber(pet.age), // Map age to number
      vaccination: pet.attributes.shots_current ? 'Yes' : 'No',
      imageUrls: pet.photos.map((photo) => photo.medium),
      location: `${pet.contact.address.city}, ${pet.contact.address.state}`,
      owner: user._id, // Assign the user as the owner
    });

    await newPet.save();
  }

  console.log('Pets added to the database');
  mongoose.connection.close();
}

addPetsToDatabase().catch(console.error);
