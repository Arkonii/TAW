const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = 3000;

const cors = require('cors');

// Ustawienie obsługi żądań CORS
app.use(cors());

// Połączenie z bazą danych MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Middleware do analizy ciała żądania w formacie JSON
app.use(bodyParser.json());

// Middleware do autoryzacji
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401);
    }
    jwt.verify(token, 'secret', (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


// Ścieżka do plików statycznych aplikacji Angular
app.use(express.static(path.join(__dirname, 'frontend/dist/frontend')));

// Dodawanie/edycja zasobu
app.post('/api/resources', authenticateToken, (req, res) => {
    const { name, description } = req.body;
    // Tworzenie/edycja zasobu w bazie danych
    // ...

    res.sendStatus(201);
});

// Usuwanie zasobu
app.delete('/api/resources/:id', authenticateToken, (req, res) => {
    const resourceId = req.params.id;
    // Usuwanie zasobu z bazy danych
    // ...

    res.sendStatus(204);
});

// Rejestracja użytkownika
const User = require('./models/user'); // Import modelu użytkownika

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Proszę wypełnić wszystkie pola formularza!' });
    }

    User.findOne({ username })
        .then(existingUser => {
            if (existingUser) {
                return res.status(409).json({ message: 'Użytkownik o podanej nazwie już istnieje.' });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);

            const newUser = new User({ username, password: hashedPassword });
            newUser.save()
                .then(() => {
                    res.sendStatus(201);
                })
                .catch(() => {
                    res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
                });
        })
        .catch(() => {
            res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
        });
});

const Message = require('./models/message'); // Import modelu wiadomości

// Pobieranie wiadomości
app.get('/api/messages', (req, res) => {
    Message.find({})
        .then(messages => {
            res.json(messages);
        })
        .catch(() => {
            res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
        });
});

// Dodawanie wiadomości
app.post('/api/messages', authenticateToken, (req, res) => {
    const { username, content } = req.body;
    const newMessage = new Message({ username, content });
    newMessage.save()
        .then(() => {
            res.sendStatus(201);
        })
        .catch(() => {
            res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
        });
});

// Usuwanie wiadomości
app.delete('/api/messages/:id', authenticateToken, (req, res) => {
    const messageId = req.params.id;
    if (!messageId) {
        return res.status(400).json({ message: 'Brak identyfikatora wiadomości.' });
    }
    Message.findByIdAndRemove(messageId)
        .then(() => {
            res.sendStatus(204);
        })
        .catch(() => {
            res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
        });
});

const Token = require('./models/token'); // Import modelu tokenu
// Logowanie użytkownika
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Proszę wypełnić wszystkie pola formularza!' });
    }

    User.findOne({ username })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Nieprawidłowe dane logowania.' });
            }

            const passwordMatch = bcrypt.compareSync(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Nieprawidłowe dane logowania.' });
            }

            const token = jwt.sign({ username }, 'secret');
            const newToken = new Token({ token, userId: user._id });
            newToken.save()
                .then(() => {
                    res.json({ token });
                })
                .catch(() => {
                    res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
                });
        })
        .catch(() => {
            res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
        });
});

// Usuwanie tokenu po wylogowaniu
app.post('/api/logout', authenticateToken, (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    Token.findOneAndDelete({ token })
        .then(() => {
            res.json({ message: 'Wylogowano pomyślnie.' });
        })
        .catch(() => {
            res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
        });
});


// Obsługa żądania index.html dla każdej nieznalezionej ścieżki
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/frontend/index.html'));
});

// Uruchomienie serwera
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
