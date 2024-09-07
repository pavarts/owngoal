const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Initialize Sequelize for PostgreSQL
const sequelize = new Sequelize('owngoal', 'owngoalowner', 'LosfeliZ67!', {
  host: 'localhost', // or your database host
  dialect: 'postgres',
  port: 5432, // default PostgreSQL port, change if yours is different
  logging: console.log // This will log the SQL queries
});

// Define User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database successfully.');

    // Sync the model with the database
    await User.sync();

    const password = 'TiafoE78@!'; // Replace with your actual password
    console.log('Using password:', password);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    // Create the admin user
    const adminUser = await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully:', adminUser.username);
  } catch (error) {
    console.error('Error creating admin user:', error);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
  } finally {
    await sequelize.close();
  }
}

createAdminUser();