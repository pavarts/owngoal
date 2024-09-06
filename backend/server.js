require('dotenv').config(); // Load environment variables from .env file

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3001';

const express = require('express'); //mports the Express module. Node.js uses require to include modules.
const jwt = require('jsonwebtoken'); //library used to create and verify JSON web tokens (used for auth)
const bcrypt = require('bcryptjs'); //library for hashing passwords
const app = express(); //Creates an instance of an Express application. This object, app, is used to configure the server and tell it how to handle HTTP requests.
const PORT = 3000; //Specifies the port number on which the server will listen for requests. localhost at port 3000 is where the server is running
const moment = require('moment-timezone');
const { google } = require('googleapis');
const sheets = google.sheets('v4');

const cors = require('cors');
app.use(cors());  // This will allow all cross-origin requests
app.use(express.json()); // Middleware to parse JSON bodies
const crypto = require('crypto'); //for email sending reset password

//importing all models
const db = require('./models');
const { User, Team, Competition, Bar, Event, Match, TeamCompetitions } = db; // Destructure the necessary models
const sequelize = db.sequelize;// use sequelize to define models, make queries, etc

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;
const credentials = require('./owngoal-424400-8c5b0a3cae52.json');

const { Op } = require('sequelize');

//sending google emails
const nodemailer = require('nodemailer');


//TODO - validation and sanitization of Data  (use express-validator)
//TODO - error handling - Add a centralized error handling middleware to handle any uncaught errors and send a consistent response to the client.
//TODO - logging - log important events and errors
//TODO - auth
//TODO - env configuration - Ensure your application is properly configured to handle different environments (development, production, etc.). You can use environment variables for configuration settings.

//**************************************************************************************************************************************************************************************
// * AUTH **************************************************************************************************************************************************************************************
//**************************************************************************************************************************************************************************************

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

//Mail endpoints
// Configure OAuth2 client
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

// Function to send email
async function sendEmail(to, subject, text) {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'admin@owngoalproject.com',
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: 'OwnGoal Admin <admin@owngoalproject.com>',
      to: to,
      subject: subject,
      text: text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

//Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt for username:', username);
  
  const user = await db.User.findOne({ where: { username } });

  if (user == null) {
    console.log('User not found');
    return res.status(400).json({ message: 'Cannot find user' });
  }

  try {
    console.log('Stored hashed password:', user.password);
    console.log('Provided password:', password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (isMatch) {
      const accessToken = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET);
      console.log('Login successful for user:', username);
      res.json({ accessToken, role: user.role });
    } else {
      console.log('Incorrect password for user:', username);
      res.status(401).json({ message: 'Not Allowed' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//forgot password
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { username: email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    const resetUrl = `${BASE_URL}/set-password/${resetToken}`;
    await sendEmail(
      email,
      'Password Reset',
      `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${resetUrl}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
    );

    res.json({ message: 'Password reset link has been sent to your email' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//set or reset password
app.post('/set-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).send('Password reset token is invalid or has expired.');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log('Password about to be saved:', hashedPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.log('Password after save:', user.password);
    console.log('Password reset successful for user:', user.username);

    res.send('Password has been set successfully.');
  } catch (error) {
    console.error('Error setting password:', error);
    res.status(500).send('Error setting password');
  }
});

// google sheets API
// Configure a JWT auth client
let jwtClient = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

// Authenticate request
jwtClient.authorize(function (err, tokens) {
if (err) {
  console.log("Error authenticating:", err);
  return;
} else {
  console.log("Successfully connected to Google Sheets API!");
}
});

// * All protected routes *****************************************************************************************************************************************************************************************

// admin
app.get('/admin', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    const teams = await db.Team.findAll();
    res.json(teams);
  });


//admin - teams
app.get('/admin/teams', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    const teams = await db.Team.findAll();
    res.json(teams);
  });

//admin - competitions
app.get('/admin/competitions', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    const teams = await db.Team.findAll();
    res.json(teams);
  });

//admin - bars
app.get('/admin/bars', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    const teams = await db.Team.findAll();
    res.json(teams);
  });

//admin - matches
app.get('/admin/matches', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    const teams = await db.Team.findAll();
    res.json(teams);
  });

  // * Google sheets *****************************************************************************************************************************************************************************************

  app.post('/bar-signup', async (req, res) => {
    try {
      const { barName, city, state, email, timestamp } = req.body;
      console.log('Received bar signup:', { barName, city, state, email, timestamp });
  
      const values = [[timestamp, barName, city, state, email]];
  
      const request = {
        auth: jwtClient,
        spreadsheetId: '1gt_LPIATq3naCy36RvTrQxYXCvHVsXb7OZFTTJhfCX4',
        range: 'Sheet1!A:E',  // Updated to include the timestamp column
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: values
        }
      };
  
      console.log('Sending request to Google Sheets API:', JSON.stringify(request, null, 2));
  
      const response = await sheets.spreadsheets.values.append(request);
  
      console.log('Google Sheets API response:', JSON.stringify(response.data, null, 2));
      res.status(201).json({ message: 'Bar registration successful' });
    } catch (error) {
      console.error('Error registering bar:', error);
      if (error.response) {
        console.error('Error response:', JSON.stringify(error.response.data, null, 2));
      }
      res.status(500).json({ error: 'Failed to register bar', details: error.message });
    }
  });
//**************************************************************************************************************************************************************************************
// * DB INITIALIZATION **************************************************************************************************************************************************************************************
//**************************************************************************************************************************************************************************************

// Initialize database and start server
sequelize.sync({ force: process.env.NODE_ENV === 'development' }) // Use force only in development
  .then(() => {
    console.log('Database tables created successfully');
    app.listen(PORT, () => {
        console.log(`Server is running on ${BASE_URL}`);
    });
  })
  .catch((error) => {
    console.error('Error during database synchronization:', error);
});


//**************************************************************************************************************************************************************************************
// * ENDPOINTS **************************************************************************************************************************************************************************************
//**************************************************************************************************************************************************************************************


// * All TEAMS endpoints ************************************************************************************************************************************************************
//endpoint for getting team information
app.get('/teams', async (req, res) => {
  try {
    const { includeHidden } = req.query;
    let where = {};
    if (includeHidden !== 'true') {
      where.hidden = false;
    }
    const teams = await db.Team.findAll({
      where,
      include: [
        {
          model: db.Competition,
          as: 'competitions',
          through: {
            attributes: []
          }
        }
      ]
    });
    res.json(teams);
  } catch (error) {
    console.error('Failed to retrieve teams:', error);
    res.status(500).send('Error retrieving teams from the database.');
  }
});

//endpoint for getting specific team information
app.get('/teams/:id', async (req, res) => {
  try {
      const team = await db.Team.findByPk(req.params.id, {
          include: [{ model: db.Competition, as: 'competitions' }]
      });
      if (!team) {
          return res.status(404).send('Team not found');
      }
      res.json(team);
  } catch (error) {
      console.error('Failed to retrieve team:', error);
      res.status(500).send('Error retrieving team from the database.');
  }
});

// Endpoint for creating a new team (Create)
app.post('/teams', async (req, res) => {
  const { competitions, ...teamData } = req.body;
  try {
    const newTeam = await db.Team.create(teamData);
    if (competitions && competitions.length > 0) {
      await newTeam.setCompetitions(competitions);
    }
    res.status(201).json(newTeam);
  } catch (error) {
    console.error('Failed to create team:', error);
    res.status(500).send('Error creating team.');
  }
});

// Endpoint for updating an existing team (Update)
app.put('/teams/:id', async (req, res) => {
  const { competitions, ...teamData } = req.body;
  try {
    const team = await db.Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).send('Team not found');
    }
    await team.update(teamData);
    if (competitions && Array.isArray(competitions)) {
      const validCompetitionIds = competitions
        .map(id => parseInt(id, 10))
        .filter(id => !isNaN(id));
      await team.setCompetitions(validCompetitionIds);
    }
    
    // Fetch the updated team with associated competitions
    const updatedTeam = await db.Team.findByPk(team.id, {
      include: [{
        model: db.Competition,
        as: 'competitions',
        through: { attributes: [] }
      }]
    });
    
    res.json(updatedTeam);
  } catch (error) {
    console.error('Failed to update team:', error);
    res.status(500).send('Error updating team.');
  }
});
  
  // Endpoint for deleting a team (Delete)
  app.delete('/teams/:id', async (req, res) => {
    try {
      const team = await db.Team.findByPk(req.params.id);
      if (!team) {
        return res.status(404).send('Team not found');
      }
      await team.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete team:', error);
      res.status(500).send('Error deleting team.');
    }
  });


// * All BARS endpoints *******************************************************************************************************************************************************************
//GET endpoint for reading bar info
app.get('/bars', async (req, res) => {
  try {
    const { includeHidden } = req.query;
    let where = {};
    if (includeHidden !== 'true') {
      where.hidden = false;
    }
    const bars = await db.Bar.findAll({
      where,
      include: [{
        model: db.Team,
        as: 'supportedTeams',
        through: { attributes: [] }
      }]
    });
    res.json(bars);
  } catch (error) {
    console.error('Failed to retrieve bars:', error);
    res.status(500).send('Error retrieving bars from the database.');
  }
});

// GET endpoint for reading a single bar info by place_id
app.get('/bars/:place_id', async (req, res) => {
  try {
    const bar = await db.Bar.findOne({ 
      where: { place_id: req.params.place_id },
      include: [{
        model: db.Team,
        as: 'supportedTeams',
        through: { attributes: [] }  // This excludes the join table attributes
      }]
    });
    if (!bar) {
      return res.status(404).send('Bar not found');
    }
    res.json(bar);
  } catch (error) {
    console.error('Failed to retrieve bar:', error);
    res.status(500).send('Error retrieving bar from the database.');
  }
});

// GET endpoint for reading matches info for a bar by place_id
app.get('/bars/:place_id/matches', async (req, res) => {
  try {
      const bar = await db.Bar.findOne({ where: { place_id: req.params.place_id } });
      if (!bar) {
          return res.status(404).send('Bar not found');
      }
      const matches = await db.Match.findAll({ where: { barId: bar.id } });
      res.json(matches);
  } catch (error) {
      console.error('Failed to retrieve matches for bar:', error);
      res.status(500).send('Error retrieving matches for bar.');
  }
});

function sanitizeBarData(bar) {
  return {
    ...bar,
    capacity: bar.capacity === '' ? null : bar.capacity,
    numberOfTVs: bar.numberOfTVs === '' ? null : bar.numberOfTVs,
    instagram: bar.instagram === '' ? null : bar.instagram,
    website: bar.website === '' ? null : bar.website,
    phone: bar.phone === '' ? null : bar.phone,
    photos: bar.photos === '' ? null : bar.photos,
    bio: bar.bio === '' ? null : bar.bio,
  };
}

// Create a new bar
app.post('/bars', async (req, res) => {
  try {
    const { supportedTeams, ...barData } = req.body;
    const sanitizedBar = sanitizeBarData(barData);

    // Ensure place_id is provided and unique
    if (!sanitizedBar.place_id) {
      return res.status(400).json({ error: 'place_id is required.' });
    }
    const existingBar = await db.Bar.findOne({ where: { place_id: sanitizedBar.place_id } });
    if (existingBar) {
      return res.status(400).json({ error: 'A bar with this place_id already exists.' });
    }

    const bar = await db.Bar.create(sanitizedBar);
    
    // Associate supported teams if provided
    if (supportedTeams && supportedTeams.length > 0) {
      await bar.setSupportedTeams(supportedTeams);
    }
    
    // Fetch the created bar with associated teams
    const barWithTeams = await db.Bar.findByPk(bar.id, {
      include: [{
        model: db.Team,
        as: 'supportedTeams',
        through: { attributes: [] }
      }]
    });
    
    res.status(201).json(barWithTeams);
  } catch (error) {
    console.error('Failed to create bar:', error);
    res.status(500).json({ error: 'Failed to create bar.' });
  }
});

// Update the PUT /bars/:place_id endpoint
app.put('/bars/:place_id', authenticateToken, async (req, res) => {
  try {
    const { supportedTeams, ...barData } = req.body;
    const bar = await db.Bar.findOne({ where: { place_id: req.params.place_id } });
    if (!bar) {
      return res.status(404).json({ error: 'Bar not found.' });
    }
    const sanitizedBar = sanitizeBarData(barData);
    await bar.update(sanitizedBar);
    
    // Update supported teams if provided
    if (supportedTeams !== undefined) {
      // Ensure supportedTeams are integers
      const teamIds = supportedTeams.map(id => parseInt(id, 10));
      await bar.setSupportedTeams(teamIds);
    }
    
    // Fetch the updated bar with associated teams
    const updatedBar = await db.Bar.findByPk(bar.id, {
      include: [{
        model: db.Team,
        as: 'supportedTeams',
        through: { attributes: [] }
      }]
    });
    
    res.status(200).json(updatedBar);
  } catch (error) {
    console.error('Failed to update bar:', error);
    res.status(500).json({ error: 'Failed to update bar.' });
  }
});

// Endpoint for deleting a bar (Delete)
app.delete('/bars/:place_id', async (req, res) => {
  try {
      const bar = await db.Bar.findOne({ where: { place_id: req.params.place_id } });
      if (!bar) {
          return res.status(404).send('Bar not found');
      }
      await bar.destroy();
      res.status(204).send();
  } catch (error) {
      console.error('Failed to delete bar:', error);
      res.status(500).send('Error deleting bar.');
  }
});

// * All MATCHES endpoints *****************************************************************************************************************************************************************************
//includes get, put, post, and delete

app.post('/matches', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    const { competitionId, aTeamId, bTeamId, date, time, location } = req.body;

    // Combine date and time, specifying it's local time, then convert to UTC
    const localDateTime = moment.tz(`${date}T${time}`, moment.tz.guess());
    const utcDateTime = localDateTime.utc();

    const newMatch = await db.Match.create({
      competition_id: competitionId,
      a_team_id: aTeamId,
      b_team_id: bTeamId,
      date: utcDateTime.format('YYYY-MM-DD'),
      time: utcDateTime.format('HH:mm:ss'),
      location
    });

    // Fetch the created match with associations
    const createdMatch = await db.Match.findByPk(newMatch.id, {
      include: [
        { model: db.Competition, as: 'competition' },
        { model: db.Team, as: 'aTeam' },
        { model: db.Team, as: 'bTeam' }
      ]
    });

    // Convert UTC time back to local time for the response
    const localCreatedDateTime = moment.utc(`${createdMatch.date} ${createdMatch.time}`).tz(moment.tz.guess());

    // Format the response
    const matchDetails = {
      id: createdMatch.id,
      competitionId: createdMatch.competition_id,
      competition: createdMatch.competition ? createdMatch.competition.name : null,
      aTeamId: createdMatch.a_team_id,
      a_team: createdMatch.aTeam ? createdMatch.aTeam.name : null,
      bTeamId: createdMatch.b_team_id,
      b_team: createdMatch.bTeam ? createdMatch.bTeam.name : null,
      date: localCreatedDateTime.format('YYYY-MM-DD'),
      time: localCreatedDateTime.format('HH:mm:ss'),
      location: createdMatch.location
    };

    res.status(201).json(matchDetails);
  } catch (error) {
    console.error('Failed to create match:', error);
    res.status(500).send('Error creating match.');
  }
});

app.put('/matches/:id', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    const { competitionId, aTeamId, bTeamId, date, time, location } = req.body;

    const match = await db.Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).send('Match not found');
    }

    // Combine date and time, specifying it's local time, then convert to UTC
    const localDateTime = moment.tz(`${date}T${time}`, moment.tz.guess());
    const utcDateTime = localDateTime.utc();

    await match.update({
      competition_id: competitionId,
      a_team_id: aTeamId,
      b_team_id: bTeamId,
      date: utcDateTime.format('YYYY-MM-DD'),
      time: utcDateTime.format('HH:mm:ss'),
      location
    });

    // Fetch the updated match with associations
    const updatedMatch = await db.Match.findByPk(req.params.id, {
      include: [
        { model: db.Competition, as: 'competition' },
        { model: db.Team, as: 'aTeam' },
        { model: db.Team, as: 'bTeam' }
      ]
    });

    // Convert UTC time back to local time for the response
    const localUpdatedDateTime = moment.utc(`${updatedMatch.date} ${updatedMatch.time}`).tz(moment.tz.guess());

    // Format the response
    const matchDetails = {
      id: updatedMatch.id,
      competitionId: updatedMatch.competition_id,
      competition: updatedMatch.competition ? updatedMatch.competition.name : null,
      aTeamId: updatedMatch.a_team_id,
      a_team: updatedMatch.aTeam ? updatedMatch.aTeam.name : null,
      bTeamId: updatedMatch.b_team_id,
      b_team: updatedMatch.bTeam ? updatedMatch.bTeam.name : null,
      date: localUpdatedDateTime.format('YYYY-MM-DD'),
      time: localUpdatedDateTime.format('HH:mm:ss'),
      location: updatedMatch.location
    };

    res.json(matchDetails);
  } catch (error) {
    console.error('Failed to update match:', error);
    res.status(500).send('Error updating match.');
  }
});
  
  // DELETE endpoint for deleting a match
  app.delete('/matches/:id', async (req, res) => {
    try {
      const match = await db.Match.findByPk(req.params.id);
      if (!match) {
        return res.status(404).send('Match not found');
      }
      await match.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete match:', error);
      res.status(500).send('Error deleting match.');
    }
  });
// Fetch all UPCOMING and CURRENT matches with related data
app.get('/matches/upcoming', async (req, res) => {
  try {
    const now = moment().utc();
    const matches = await db.Match.findAll({
      where: {
        [Op.or]: [
          { date: { [Op.gt]: now.format('YYYY-MM-DD') } },
          {
            [Op.and]: [
              { date: now.format('YYYY-MM-DD') },
              { time: { [Op.gte]: now.format('HH:mm:ss') } }
            ]
          }
        ]
      },
      include: [
        { model: db.Competition, as: 'competition' },
        { model: db.Team, as: 'aTeam' },
        { model: db.Team, as: 'bTeam' }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });


    const matchesWithDetails = matches.map(match => {
      return {
        id: match.id,
        competitionId: match.competition_id,
        competition: match.competition ? match.competition.name : null,
        aTeamId: match.a_team_id,
        a_team_logo: match.aTeam ? match.aTeam.logo : null,
        a_team: match.aTeam ? match.aTeam.name : null,
        a_team_short_name: match.aTeam ? match.aTeam.short_name : null,
        bTeamId: match.b_team_id,
        b_team_logo: match.bTeam ? match.bTeam.logo : null,
        b_team: match.bTeam ? match.bTeam.name : null,
        b_team_short_name: match.bTeam ? match.bTeam.short_name : null,
        date: match.date,
        time: match.time,
        location: match.location,
      };
    });

    res.json(matchesWithDetails);
  } catch (error) {
    console.error('Failed to retrieve matches:', error);
    res.status(500).send('Error retrieving matches from the database.');
  }
});

// Fetch ALL matches with related data
app.get('/matches/all', authenticateToken, async (req, res) => {
  try {
    const matches = await db.Match.findAll({
      include: [
        { model: db.Competition, as: 'competition' },
        { model: db.Team, as: 'aTeam' },
        { model: db.Team, as: 'bTeam' }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    const matchesWithDetails = matches.map(match => {
      return {
        id: match.id,
        competitionId: match.competition_id,
        competition: match.competition ? match.competition.name : null,
        aTeamId: match.a_team_id,
        a_team: match.aTeam ? match.aTeam.name : null,
        a_team_logo: match.aTeam ? match.aTeam.logo : null,
        a_team_short_name: match.aTeam ? match.aTeam.short_name : null,
        bTeamId: match.b_team_id,
        b_team: match.bTeam ? match.bTeam.name : null,
        b_team_logo: match.bTeam ? match.bTeam.logo : null,
        b_team_short_name: match.bTeam ? match.bTeam.short_name : null,
        date: match.date,
        time: match.time,
        location: match.location,
      };
    });

    res.json(matchesWithDetails);
  } catch (error) {
    console.error('Failed to retrieve matches:', error);
    res.status(500).send('Error retrieving matches from the database.');
  }
});

//Get information on a specific match
app.get('/matches/:id', async (req, res) => {
  try {
    const match = await db.Match.findByPk(req.params.id, {
      include: [
        {
          model: db.Competition,
          as: 'competition'
        },
        {
          model: db.Team,
          as: 'aTeam'
        },
        {
          model: db.Team,
          as: 'bTeam'
        }
      ]
    });
    
    if (!match) {
      return res.status(404).send('Match not found');
    }
    
    const matchDetails = {
      id: match.id,
      competition: match.competition ? match.competition.name : null,
      a_team_logo: match.aTeam ? match.aTeam.logo : null,
      a_team: match.aTeam ? match.aTeam.name : null,
      b_team_logo: match.bTeam ? match.bTeam.logo : null,
      b_team: match.bTeam ? match.bTeam.name : null,
      date: match.date,
      time: match.time,
      location: match.location,
      aTeamId: match.aTeam ? match.aTeam.id : null, 
      bTeamId: match.bTeam ? match.bTeam.id : null   
    };
    
    res.json(matchDetails);
  } catch (error) {
    console.error('Failed to fetch match details:', error);
    res.status(500).send('Error fetching match details.');
  }
});



//endpoint for getting bar data for a specific match
app.get('/matches/:id/bars', async (req, res) => { //defines the GET endpoint in the server (/matches/:id/bars)
    try {
      const events = await db.Event.findAll({ //findAll fetches all eventsd
        where: { match_id: req.params.id }, //filters the events based on the match_id parameter from the request URL (req.params.id)
        include: [
            { 
                model: db.Bar, //includes bar data based on the associations between Bar and Event
                include: [
                    {
                        model: db.Team,
                        through: 'BarTeam',
                        as: 'supportedTeams'
                    }
                ]
            }] 
      });
      
      //iterates over the array of events and stores it in barData which is then sent as a json response
      const barData = events.map(event => ({
        name: event.Bar.name,
        lat: event.Bar.latitude,
        lng: event.Bar.longitude,
        sound: event.sound,
        supportedTeams: event.Bar.supportedTeams.map(team => team.name),
        place_id: event.Bar.place_id
      }));
  
      res.json(barData);
    } catch (error) {
      console.error('Failed to retrieve bars:', error);
      res.status(500).send('Error retrieving bars from the database.');
    }
  });


//endpoint for past events
app.get('/bars/:place_id/past-events', authenticateToken, async (req, res) => {
  try {
    const bar = await db.Bar.findOne({ where: { place_id: req.params.place_id } });
    if (!bar) {
      return res.status(404).send('Bar not found');
    }
    const now = new Date();
    const pastEvents = await db.Event.findAll({
      where: { 
        bar_id: bar.id,
        '$Match.endTime$': {
          [Op.lt]: now
        }
      },
      include: [
        {
          model: db.Match,
          include: [
            { model: db.Team, as: 'aTeam' },
            { model: db.Team, as: 'bTeam' },
            { model: db.Competition, as: 'competition' }
          ]
        }
      ],
      order: [
        [db.Match, 'date', 'DESC'],
        [db.Match, 'time', 'DESC']
      ]
    });

    const pastEventsWithDetails = pastEvents.map(event => ({
      id: event.id,
      a_team_logo: event.Match.aTeam.logo,
      b_team_logo: event.Match.bTeam.logo,
      a_team: event.Match.aTeam.name,
      b_team: event.Match.bTeam.name,
      match: `${event.Match.aTeam.name} vs ${event.Match.bTeam.name}`,
      date: event.Match.date,
      time: event.Match.time,
      sound: event.sound,
      earlyOpening: event.earlyOpening,
      openingTime: event.openingTime,
      competition: event.Match.competition ? event.Match.competition.name : null,
      match_id: event.Match.id
    }));

    res.json(pastEventsWithDetails);
  } catch (error) {
    console.error('Failed to retrieve past events:', error);
    res.status(500).send('Error retrieving past events.');
  }
});


// * ALL COMPETITIONS endpoints *****************************************************************************************************************************************************************************
//endpoint for gettign competition data
app.get('/competitions', async (req, res) => {
    try {
        const competitions = await db.Competition.findAll();
        res.json(competitions);
    } catch (error) {
        console.error('Failed to retrieve competitions:', error);
        res.status(500).send('Error retrieving competitions from the database.');
    }
});

// Endpoint for creating a new competition (Create)
app.post('/competitions', async (req, res) => {
    try {
      const newCompetition = await db.Competition.create(req.body);
      res.status(201).json(newCompetition);
    } catch (error) {
      console.error('Failed to create competition:', error);
      res.status(500).send('Error creating competition.');
    }
  });
  
  // Endpoint for updating an existing competition (Update)
  app.put('/competitions/:id', async (req, res) => {
    try {
      const competition = await db.Competition.findByPk(req.params.id);
      if (!competition) {
        return res.status(404).send('Competition not found');
      }
      await competition.update(req.body);
      res.json(competition);
    } catch (error) {
      console.error('Failed to update competition:', error);
      res.status(500).send('Error updating competition.');
    }
  });
  
  // Endpoint for deleting a competition (Delete)
  app.delete('/competitions/:id', async (req, res) => {
    try {
      const competition = await db.Competition.findByPk(req.params.id);
      if (!competition) {
        return res.status(404).send('Competition not found');
      }
      await competition.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete competition:', error);
      res.status(500).send('Error deleting competition.');
    }
  });

  // Endpoint for getting the teams playing in a competition
  app.get('/competitions/:id/teams', async (req, res) => {
    try {
      const competitionId = req.params.id;
      const competition = await db.Competition.findByPk(competitionId, {
        include: { model: db.Team, as: 'teams' }
      });
  
      if (!competition) {
        return res.status(404).json({ error: 'Competition not found' });
      }

      res.json(competition.teams);
    } catch (error) {
      console.error('Error fetching teams for competition:', error);
      res.status(500).json({ error: 'An error occurred while fetching teams' });
    }
  });
  


  // * ALL EVENTS endpoints *****************************************************************************************************************************************************************************
// GET events for a specific bar
app.get('/bars/:place_id/events', async (req, res) => {
  try {
    const bar = await db.Bar.findOne({ where: { place_id: req.params.place_id } });
    if (!bar) {
      return res.status(404).send('Bar not found');
    }
    const events = await db.Event.findAll({
      where: { bar_id: bar.id },
      include: [
        {
          model: db.Match,
          include: [
            { model: db.Team, as: 'aTeam' },
            { model: db.Team, as: 'bTeam' },
            { model: db.Competition, as: 'competition' }
          ],
          order: [
            [db.Match, 'date', 'ASC'],
            [db.Match, 'time', 'ASC']
          ]
        }
      ]
    });
    const eventsWithDetails = events.map(event => ({
      id: event.id,
      a_team_logo: event.Match.aTeam.logo,
      b_team_logo: event.Match.bTeam.logo,
      a_team: event.Match.aTeam.name,
      b_team: event.Match.bTeam.name,
      match: `${event.Match.aTeam.name} vs ${event.Match.bTeam.name}`,
      date: event.Match.date, 
      time: event.Match.time, 
      sound: event.sound,
      earlyOpening: event.earlyOpening,
      openingTime: event.openingTime,
      competition: event.Match.competition ? event.Match.competition.name : null,
      match_id: event.Match.id // Ensure match_id is included
    }));
    res.json(eventsWithDetails);
  } catch (error) {
    console.error('Failed to retrieve events:', error);
    res.status(500).send('Error retrieving events.');
  }
});

// GET current and upcoming events for a specific bar
app.get('/bars/:place_id/events/upcoming', async (req, res) => {
  try {
    const bar = await db.Bar.findOne({ where: { place_id: req.params.place_id } });
    if (!bar) {
      return res.status(404).send('Bar not found');
    }
    const now = moment().utc();
    const upcomingEvents = await db.Event.findAll({
      where: { 
        bar_id: bar.id,
        [Op.or]: [
          { '$Match.date$': { [Op.gt]: now.format('YYYY-MM-DD') } },
          {
            [Op.and]: [
              { '$Match.date$': now.format('YYYY-MM-DD') },
              db.sequelize.where(
                db.sequelize.fn('CONCAT', 
                  db.sequelize.col('Match.date'), 
                  ' ', 
                  db.sequelize.col('Match.time')
                ),
                {
                  [Op.gte]: now.subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
                }
              )
            ]
          }
        ]
      },
      include: [
        {
          model: db.Match,
          include: [
            { model: db.Team, as: 'aTeam' },
            { model: db.Team, as: 'bTeam' },
            { model: db.Competition, as: 'competition' }
          ]
        }
      ],
      order: [
        [db.Match, 'date', 'ASC'],
        [db.Match, 'time', 'ASC']
      ]
    });

    const upcomingEventsWithDetails = upcomingEvents.map(event => ({
      id: event.id,
      a_team_logo: event.Match.aTeam.logo,
      b_team_logo: event.Match.bTeam.logo,
      a_team: event.Match.aTeam.name,
      b_team: event.Match.bTeam.name,
      match: `${event.Match.aTeam.name} vs ${event.Match.bTeam.name}`,
      date: event.Match.date,
      time: event.Match.time,
      sound: event.sound,
      earlyOpening: event.earlyOpening,
      openingTime: event.openingTime,
      competition: event.Match.competition ? event.Match.competition.name : null,
      match_id: event.Match.id
    }));

    res.json(upcomingEventsWithDetails);
  } catch (error) {
    console.error('Failed to retrieve upcoming events:', error);
    res.status(500).send('Error retrieving upcoming events.');
  }
});

// POST endpoint for creating a new event
app.post('/events', async (req, res) => {
  try {
    const { bar_place_id, match_id, sound, earlyOpening, openingTime } = req.body;

    // Find the bar by place_id
    const bar = await db.Bar.findOne({ where: { place_id: bar_place_id } });

    if (!bar) {
      return res.status(404).send('Bar not found');
    }

    const newEvent = await db.Event.create({
      bar_id: bar.id,
      match_id,
      sound,
      earlyOpening,
      openingTime: openingTime || null  // Handle empty string as null
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Failed to create event:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

app.post('/bars/:place_id/events', async (req, res) => {
  try {
    const bar = await db.Bar.findOne({ where: { place_id: req.params.place_id } });
    if (!bar) {
      return res.status(404).send('Bar not found');
    }
    const event = await db.Event.create({
      bar_id: bar.id,
      match_id: req.body.match_id,
      sound: req.body.sound,
      earlyOpening: req.body.earlyOpening,
      openingTime: req.body.openingTime
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Failed to create event:', error);
    res.status(500).send('Error creating event.');
  }
});

// Update an existing event
app.put('/events/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      return res.status(400).send('Invalid event ID');
    }

    const event = await db.Event.findByPk(eventId);
    if (!event) {
      return res.status(404).send('Event not found');
    }

    const { sound, earlyOpening, openingTime } = req.body;
    await event.update({ 
      sound, 
      earlyOpening, 
      openingTime: earlyOpening ? openingTime : null 
    });

    res.json(event);
  } catch (error) {
    console.error('Failed to update event:', error);
    res.status(500).send('Error updating event.');
  }
});

// Delete an existing event
app.delete('/events/:id', async (req, res) => {
  try {
    const event = await db.Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).send('Event not found');
    }
    await event.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete event:', error);
    res.status(500).send('Error deleting event.');
  }
});

// * ALL SEARCH endpoints *****************************************************************************************************************************************************************************
// GET teams, bars, and matches in search
app.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
  
    const now = moment().utc(); // Define 'now' here

    // Search in Teams
    const teams = await db.Team.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { name: { [db.Sequelize.Op.iLike]: `%${query}%` } },
          { short_name: { [db.Sequelize.Op.iLike]: `%${query}%` } }
        ]
      },
      limit: 5
    });

    // Search in Matches
    const matches = await db.Match.findAll({
      include: [
        { model: db.Team, as: 'aTeam' },
        { model: db.Team, as: 'bTeam' },
        { model: db.Competition, as: 'competition' }
      ],
      where: {
        [db.Sequelize.Op.and]: [
          {
            [db.Sequelize.Op.or]: [
              { '$aTeam.name$': { [db.Sequelize.Op.iLike]: `%${query}%` } },
              { '$bTeam.name$': { [db.Sequelize.Op.iLike]: `%${query}%` } }
            ]
          },
          {
            [db.Sequelize.Op.or]: [
              { date: { [db.Sequelize.Op.gt]: now.format('YYYY-MM-DD') } },
              {
                [db.Sequelize.Op.and]: [
                  { date: now.format('YYYY-MM-DD') },
                  { time: { [db.Sequelize.Op.gte]: now.format('HH:mm:ss') } }
                ]
              }
            ]
          }
        ]
      },
      limit: 5
    });

    // Search in Bars
    const bars = await db.Bar.findAll({
      where: {
        name: { [db.Sequelize.Op.iLike]: `%${query}%` }
      },
      limit: 5
    });

    res.json({ teams, matches, bars });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'An error occurred during search' });
  }
});

// * ALL USERS endpoints *****************************************************************************************************************************************************************************

// Get all users
app.get('/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  try {
    const users = await User.findAll({
      include: [{ model: Bar, attributes: ['name', 'place_id'] }],
      attributes: ['id', 'username', 'role', 'barId']
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
});

// Update a user
app.put('/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    const { username, password, role, barId } = req.body;
    const updates = { username, role, barId: barId || null };
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    await user.update(updates);
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user');
  }
});

// Delete a user
app.delete('/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    await user.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Error deleting user');
  }
});

app.post('/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  try {
    const { username, role, barId } = req.body;
    const resetPasswordToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    const newUser = await User.create({
      username,
      role,
      barId: barId || null,
      resetPasswordToken,
      resetPasswordExpires,
      password: null 
    });

    const resetUrl = `${BASE_URL}/set-password/${resetPasswordToken}`;
    await sendEmail(
      username,
      'Set Your Password',
      `You are receiving this because an account has been created for you on OwnGoal.\n\n
      Please click on the following link, or paste this into your browser to set your password:\n\n
      ${resetUrl}\n\n
      If you did not expect this, please contact the administrator.\n`
    );

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});

// Get current user
app.get('/current-user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.user.username },
      include: [{ model: Bar, attributes: ['name'] }]
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      username: user.username,
      role: user.role,
      barName: user.Bar ? user.Bar.name : null
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user role
app.get('/user-role', authenticateToken, (req, res) => {
  res.json({ role: req.user.role });
});

app.get('/bar-profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.user.username },
      include: [{ 
        model: Bar, 
        attributes: ['id', 'place_id', 'name', 'location', 'capacity', 'phone', 'instagram', 'website', 'photos', 'numberOfTVs', 'hasOutdoorSpace', 'bio'],
        include: [{
          model: Team,
          as: 'supportedTeams',
          through: { attributes: [] }
        }]
      }]
    });

    if (!user || !user.Bar) {
      return res.status(404).json({ message: 'Bar profile not found' });
    }

    res.json(user.Bar);
  } catch (error) {
    console.error('Error fetching bar profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user's email
app.put('/update-email', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.user.username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { email } = req.body;
    await user.update({ username: email });
    
    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change user's password
app.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.user.username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { oldPassword, newPassword } = req.body;
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

