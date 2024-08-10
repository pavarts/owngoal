//the purpose of this file to use the placeID as an input to request the google places api to fill in remaining details for a bar

const db = require('./models'); // Adjust the path if necessary
const axios = require('axios');
require('dotenv').config(); // Ensure to load environment variables from .env file

async function getBarDetails(placeId) {
  const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
    params: {
      place_id: placeId,
      fields: 'name,formatted_address,formatted_phone_number,website,editorial_summary',
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  if (response.data.result) {
    return response.data.result;
  } else {
    console.error(`No details found for place_id: ${placeId}`);
    return null;
  }
}

async function updateBarDetails() {
  try {
    // Fetch all bars with place_id from the database
    const bars = await db.Bar.findAll({ where: { place_id: { [db.Sequelize.Op.ne]: null } } });

    for (const bar of bars) {
      const details = await getBarDetails(bar.place_id);
      if (details) {
        bar.location = details.formatted_address || bar.location;
        bar.phone = details.formatted_phone_number || bar.phone;
        bar.website = details.website || bar.website;
        bar.bio = details.editorial_summary ? details.editorial_summary.text : bar.bio;
        
        await bar.save();
        console.log(`Updated details for bar: ${bar.name}`);
      }
    }

    console.log('All bars updated successfully!');
  } catch (error) {
    console.error('Error updating bar details:', error);
  }
}

updateBarDetails();
