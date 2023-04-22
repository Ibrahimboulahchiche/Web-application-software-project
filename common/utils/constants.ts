// Default ranking score time
export { THREE_MINUTES_TO_SECONDS, FOUR_MINUTES_TO_SECONDS, FIVE_MINUTES_TO_SECONDS };
// Queue displayed texts
export {
    DO_YOU_WANT_TO_PLAY_WITH_TEXT,
    WAITING_FOR_PLAYER_TEXT,
    WAITING_PLAYER_ANSWER_TEXT,
    REDIRECTED_WHEN_GAME_DELETED_TEXT,
    LIMITED_TIME_USER_ENTERED_TEXT,
    REDIRECTED_TO_MAIN_PAGE_TEXT,
};
// Pop up displayed texts
export {
    ALL_GAMES_TEXT,
    THIS_GAME_TEXT,
    DELETE_TEXT,
    RESET_TEXT,
    ABORTED_GAME_TEXT,
    QUITTING_CONFIRMATION_TEXT,
    EXCELLENT_GAME_TEXT,
    OPPONENT_QUITTED_THE_GAME_TEXT,
    PARTNER_LEFT_THE_GAME_TEXT,
};
// Buttons actions texts
export { YES_TEXT, NO_TEXT, OK_TEXT, MAIN_MENU_TEXT, REPLAY_MODE_TEXT };
// Replay mode speed
export { NORMAL_SPEED, TWO_TIMES_SPEED, FOUR_TIMES_SPEED };
// Default game constants
export { INITIAL_COUNTDOWN, INITIAL_PENALTY, INITIAL_BONUS, MAX_PENALTY, MAX_BONUS };
export { CHAT_TITLE };
export { PEN_WIDTH, MAX_PEN_WIDTH };
export { BMP_FILE_HEADER_BYTES_LENGTH, PIXEL_BYTES_LENGTH };
export { NOT_FOUND };
export { CANVAS_HEIGHT, CANVAS_WIDTH };
export { MILLISECOND_TO_SECONDS, QUARTER_SECOND, MINUTE_TO_SECONDS, MINUTE_LIMIT, LIMITED_TIME_DURATION, MINIMUM_TIME_MILLISECONDS };
export { IMAGE_WIDTH_OFFSET, IMAGE_HEIGHT_OFFSET };
export { BLINK_TIME, NUMBER_OF_BLINKS };
export { SYSTEM_NAME };
export { MIN_NBR_OF_DIFFERENCES, MAX_NBR_OF_DIFFERENCES, MIN_HARD_DIFFERENCES, QUARTER };
export { REQUIRED_SURFACE_PERCENTAGE, DEFAULT_ENLARGEMENT_RADIUS };
export { VOLUME_ERROR, VOLUME_SUCCESS };
export { MAX_GAMES_PER_PAGE };
export { ROUTE_TO_SENDING_IMAGE };
export { NUMBER_HINTS };
export { REPLAY_TIMER_DELAY };
export {
    FILE_WRITTEN,
    FILE_WAS_NOT_WRITTEN,
    GAME_DATA_NOT_FOUND,
    ERROR_READING_IMAGE,
    ERROR_READING_SECOND_IMAGE,
    FOLDER_NOT_CREATED,
    FOLDER_CREATED,
    DELETE_SUCCESS,
    ERROR,
    DATABASE_CONNECTION_ERROR,
    DATABASE_CONNECTION_SUCCESS,
    REQUIRED_ELEVATED_PRIVILEGES,
    ALREADY_IN_USE,
};

const MAX_GAMES_PER_PAGE = 4;
const NOT_FOUND = -1;

// Game creation drawing
const MAX_PEN_WIDTH = 20;
const PEN_WIDTH = 10;
const DEFAULT_ENLARGEMENT_RADIUS = 3;

// Time constants
const LIMITED_TIME_DURATION = 120;
const MILLISECOND_TO_SECONDS = 1000;
const REPLAY_TIMER_DELAY = 50;
const QUARTER_SECOND = 250;
const MINUTE_TO_SECONDS = 60;
const MINUTE_LIMIT = 10;
const BLINK_TIME = 100;
const MINIMUM_TIME_MILLISECONDS = 16;

// Game creation image
const ROUTE_TO_SENDING_IMAGE = '/image_processing/send-image';
const IMAGE_WIDTH_OFFSET = 18;
const IMAGE_HEIGHT_OFFSET = 22;
const BMP_FILE_HEADER_BYTES_LENGTH = 54;
const PIXEL_BYTES_LENGTH = 3;
const REQUIRED_SURFACE_PERCENTAGE = 0.15;

// Hints
const MIN_NBR_OF_DIFFERENCES = 3;
const MAX_NBR_OF_DIFFERENCES = 9;
const MIN_HARD_DIFFERENCES = 7;
const NUMBER_HINTS = 3;
const NUMBER_OF_BLINKS = 3;
const QUARTER = 4;

// Default ranking scores
const THREE_MINUTES_TO_SECONDS = 180;
const FOUR_MINUTES_TO_SECONDS = 240;
const FIVE_MINUTES_TO_SECONDS = 300;

// Queue displayed messages
const DO_YOU_WANT_TO_PLAY_WITH_TEXT = 'Voulez-vous jouer avec ';
const WAITING_FOR_PLAYER_TEXT = "En attente d'un adversaire...";
const WAITING_PLAYER_ANSWER_TEXT = "En attente de la réponse de l'adversaire...";
const REDIRECTED_WHEN_GAME_DELETED_TEXT = 'Le jeu a été supprimé, vous avez donc été redirigé';
const LIMITED_TIME_USER_ENTERED_TEXT = 'Quel mode de jeu voulez-vous jouer ?';
const REDIRECTED_TO_MAIN_PAGE_TEXT = 'Vous avez été redirigé vers la page principale';

// Pop up displayed texts
const ALL_GAMES_TEXT = 'TOUS LES JEUX ?';
const THIS_GAME_TEXT = 'CE JEU ?';
const DELETE_TEXT = 'SUPPRIMER ';
const RESET_TEXT = 'RÉINITIALISER ';
const QUITTING_CONFIRMATION_TEXT = 'VOULEZ-VOUS VRAIMENT QUITTER ?';
const ABORTED_GAME_TEXT = ' a abandonné la partie';
const EXCELLENT_GAME_TEXT = 'Excellente partie !';
const PARTNER_LEFT_THE_GAME_TEXT = 'Votre partenaire a quitté la partie...';
const OPPONENT_QUITTED_THE_GAME_TEXT = 'Votre adversaire a quitté la partie...';

// Buttons actions texts
const YES_TEXT = 'OUI';
const NO_TEXT = 'NON';
const OK_TEXT = 'OK';
const MAIN_MENU_TEXT = 'Menu Principal';
const REPLAY_MODE_TEXT = 'Reprise Vidéo';

// Canvas fixed dimensions
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

// Chat texts elements
const CHAT_TITLE = 'MANIA CHAT';
const SYSTEM_NAME = 'System';

// Volume
const VOLUME_SUCCESS = 1;
const VOLUME_ERROR = 0.3;

// Default game constants
const INITIAL_COUNTDOWN = 30;
const INITIAL_PENALTY = 5;
const INITIAL_BONUS = 5;
const MAX_PENALTY = 10;
const MAX_BONUS = 10;

// Replay speed mode
const NORMAL_SPEED = 1;
const TWO_TIMES_SPEED = 2;
const FOUR_TIMES_SPEED = 4;

// Error messages
const GAME_DATA_NOT_FOUND = 'Game data not found for game with id';
const ERROR_READING_IMAGE = 'error reading first image';
const ERROR_READING_SECOND_IMAGE = 'error reading second image';
const FOLDER_NOT_CREATED = 'Folder not created';
const FOLDER_CREATED = 'Folder successfully created.';
const FILE_WAS_NOT_WRITTEN = 'File was not successfully written';
const FILE_WRITTEN = 'File was successfully written';
const DELETE_SUCCESS = ' deleted successfully';
const ERROR = 'error :';
const DATABASE_CONNECTION_ERROR = 'Database connection error';
const DATABASE_CONNECTION_SUCCESS = 'Database connection success !';
const REQUIRED_ELEVATED_PRIVILEGES = 'requires elevated privileges';
const ALREADY_IN_USE = 'already in use';
