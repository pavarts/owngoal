# OwnGoal

**OwnGoal** is a web application designed to help soccer fans find bars where they can watch their favorite matches. Built based on user research with sports fans, it addresses the challenge of easily locating venues that broadcast specific matches and offers bar owners a platform to manage and promote their locations. The project is currently in development.

## Features

- **Find bars showing specific soccer matches**: Leveraging bar data and the Google Places API, users can search for bars playing specific matches and filter by attributes such as sound, outdoor space, and supporter bars.
- **View upcoming matches**: Display of upcoming match details with live updates and time zone conversion.
- **Bar profiles**: Detailed information on bar capacity, number of TVs, outdoor space, and supported teams, dynamically rendered and managed by bar owners.
- **User authentication**: Bar owners can sign up and log in to manage their profiles and the matches they are broadcasting.
- **Admin panel**: Enables administrators to manage teams, matches, bars, and competitions, with a scalable structure for future features.

## Technologies Used

### Frontend:
- **React**: Modular, reusable components for user interactions and dynamic data rendering.
- **Tailwind CSS**: Fast, responsive UI development with custom utilities to ensure consistency across devices.
- **Axios**: Efficient handling of API requests to interact with the Supabase database and other services.

### Backend:
- **Node.js**: Server-side logic handling requests and data processing.
- **Express**: Routing and handling of API requests.
- **Sequelize ORM**: For structured data models and seamless integration with PostgreSQL.

### Database:
- **PostgreSQL** (hosted on Supabase): Used for storing match, team, bar, and user data.

### APIs:
- **Google Maps API**: Provides real-time location services for users to find nearby bars showing the selected matches.

### Deployment:
- **Vercel**: Continuous integration and deployment, simplifying updates and testing in production.

## Project Status

This project is currently in active development. Key features such as match-to-bar linking and user management are functional, but there are ongoing efforts to optimize performance, address known bugs, and complete additional features.

## Roadmap

- Add competition, team, match, and bar data
- Add footer
- Optimize for Safari
- Optimize for web on mobile
- Develop a native mobile app using React Native

## Contributing

This project is not open for contributions at the moment, as it is part of a personal portfolio.

## Contact

**Pavan Yalla**  
📧 Email: [admin@owngoalproject.com](mailto:admin@owngoalproject.com)  
🌐 Project Link: [OwnGoal](https://owngoalproject.com)
