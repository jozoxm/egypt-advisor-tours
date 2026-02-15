# Egypt Advisor Tours

## Project Documentation
This project provides a comprehensive guide to explore various tours in Egypt.

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/jozoxm/egypt-advisor-tours.git
   cd egypt-advisor-tours
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```bash
   PORT=3000
   DATABASE_URL=your_database_url
   API_KEY=your_api_key
   ```

## Available Scripts
- `npm start` - Starts the development server.
- `npm test` - Runs the tests.
- `npm run build` - Builds the application for production.

## API Endpoints
- `GET /api/tours` - Retrieve a list of tours.
- `POST /api/tours` - Create a new tour.
- `GET /api/tours/:id` - Get details for a specific tour.
- `PUT /api/tours/:id` - Update a specific tour.
- `DELETE /api/tours/:id` - Delete a specific tour.

## Dependencies List
- Express
- Mongoose
- Cors
- Dotenv

## Environment Variables
- `PORT`: Specify the port number.
- `DATABASE_URL`: Connection string for the database.
- `API_KEY`: Your API key for third-party services.

## Deployment Guides
### Vercel
1. Connect your GitHub account to Vercel.
2. Import the project repository.
3. Set environment variables in the Vercel dashboard.
4. Click "Deploy".

### Other Platforms
Refer to the specific platform documentation for deployment guides.

## Testing Information
To run tests, use:
```bash
npm test
```
Ensure all tests pass before submitting your changes.

## Contribution Guidelines
1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/my-feature
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add my feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/my-feature
   ```
5. Create a pull request to merge changes into the main branch.