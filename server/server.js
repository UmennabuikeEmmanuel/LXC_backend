"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const routes_1 = __importDefault(require("./routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
dotenv_1.default.config();
// CORS Configuration
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
mongoose_1.default.Promise = Promise;
const mongoUri = process.env.MONGODB_URI; // Get MongoDB URI from .env
mongoose_1.default.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose_1.default.connection.on('error', (error) => console.log(error));
app.use('/', (0, routes_1.default)());
app.get('/', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.send('Welcome to Lispendes enugu This is a platform that will provide access to the legal status of landed property/ies in Anambra State, Nigeria for interested buyers to have sufficient information on the legal standing of property/ies they have interest in purchasing or/and renting. Find the documentation here for backend api: [https://documenter.getpostman.com/view/18112964/2s9YyqjNJN]');
});
const PORT = process.env.PORT || 8000;
// const IP_ADDRESS = '0.0.0.0';
const IP_LOCAL = 'localhost';
server.listen(PORT, () => {
    console.log(`Server is running on http://${IP_LOCAL}:${PORT}`);
});
