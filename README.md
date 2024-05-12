
# Node.js API Server on Render

This project is a Node.js API server that authenticates users and manages participant data. It's set up to be deployed to Render.com using GitHub.
url: https://census-app-zeen.onrender.com/

## Prerequisites

- Node.js installed locally
- A GitHub account
- A Render.com account

## Local Setup

1. Clone the repository:
   ```
   git clone <your-repository-url>
   ```
2. Install dependencies:
   ```
   cd <your-project-directory>
   npm install
   ```
3. Create a `.env` file in the root directory and populate it with necessary environment variables:
   ```
   PORT=3000
   ```
4. Run the server locally:
   ```
   npm start
   ```

## Deployment to Render

1. Push your code to a GitHub repository.
2. Log in to your Render account.
3. Create a new Web Service and connect your GitHub repository.
4. Choose the branch you want to deploy.
5. Set the build command as:
   ```
   npm install
   ```
6. Set the start command as:
   ```
   npm start
   ```
7. Add any required environment variables under the "Environment" tab in your Render dashboard.

## Usage

The API server provides several routes for managing participants:
- POST `/participants/add`: Add a new participant
- GET `/participants`: Retrieve all participants
- GET `/participants/details`: Retrieve details of active participants
- DELETE `/participants/:email`: Delete a participant

## Security

The API uses Basic Authentication to secure endpoints. Ensure the admin credentials in `admin_credentials.json` are securely managed and not exposed in your repository.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
