// Database constants file
const DB_URL = 'mongodb+srv://Admin:admin@cluster0.z0ouwix.mongodb.net/?retryWrites=true&w=majority';
const DB_NAME = 'LOG2990';
// const DATABASE_COLLECTION_GAMES="games"

// V Uncomment the line below to use PRODUCTION database instead of development database V
const DB_COLLECTION_GAMES = 'masterGames';
const DB_COLLECTION_HISTORY = 'gameHistory';

// Server storage path
const PERSISTENT_DATA_FOLDER_PATH = './storedData/';
const DEFAULT_IMAGES_PATH = './storedData/default-img.json';
const DEFAULT_GAMES_PATH = './app/data/default-games.json';

// Stored files
const LAST_GAME_ID_FILE = 'lastGameId.txt';
const GAME_CONSTANTS_FILE = 'gameConstants.json';

// Game images specs
const ORIGINAL_IMAGE_FILE = '1.bmp';
const MODIFIED_IMAGE_FILE = '2.bmp';
const IMAGE_REQUIRED_WIDTH = '640';
const IMAGE_REQUIRED_HEIGHT = '480';
// The value of this constant varies depending on whether the website is deployed or not. If not deployed, use the commented value
const IMAGE_DELIVERY_SERVER = 'http://localhost:3000/api/images/';
// const IMAGE_DELIVERY_SERVER = 'http://ec2-35-183-123-130.ca-central-1.compute.amazonaws.com:3000/api/images/';

// Limit of games displayed
const DISPLAYED_GAMES_LIMIT = 4;

export { DB_COLLECTION_GAMES, DB_NAME, DB_URL, DB_COLLECTION_HISTORY };
export { PERSISTENT_DATA_FOLDER_PATH, DEFAULT_IMAGES_PATH, DEFAULT_GAMES_PATH };
export { LAST_GAME_ID_FILE, GAME_CONSTANTS_FILE };
export { ORIGINAL_IMAGE_FILE, MODIFIED_IMAGE_FILE, IMAGE_REQUIRED_WIDTH, IMAGE_REQUIRED_HEIGHT };
export { DISPLAYED_GAMES_LIMIT };
export { IMAGE_DELIVERY_SERVER };
