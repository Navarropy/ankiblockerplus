const express = require('express');
const fs = require('fs');
const serverless = require('serverless-http');
const app = express();
app.use(express.json());

const port = 3000;

const readFile = (filePath, callback) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, JSON.parse(data));
    });
};

const writeFile = (filePath, data, callback) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            callback(err);
            return;
        }
        callback();
    });
};


app.get('/blocker', (req, res) => {
    try {
        fs.readFile('blocker.json', 'utf8', (err, data) => {
            if (err) {
            res.status(500).send('Error reading the file');
            return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        });
    
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
  }
});

// Route to add an item
app.post('/add', (req, res) => {
    readFile('blocker.json', (err, data) => {
        if (err) {
            res.status(500).send('Error reading the file');
            return;
        }

        const key = req.body.key; // 'whitelist' or 'websites'
        const item = req.body.item;
  
        if (data[key] && item) {
            if (!data[key].includes(item)) {
                data[key].push(item);
                writeFile('blocker.json', data, (writeErr) => {
                    if (writeErr) {
                        res.status(500).send('Error writing to file');
                        return;
                    }
                    res.status(200).send(`Item added to ${key}`);
                });
            } else {
                res.status(409).send("Item already exists");
            }
        } else {
            res.status(400).send("Invalid request");
        }
    });
});

// Route to remove an item
app.post('/remove', (req, res) => {
    readFile('blocker.json', (err, data) => {
        if (err) {
            res.status(500).send('Error reading the file');
            return;
        }

        const key = req.body.key; // 'whitelist' or 'websites'
        const item = req.body.item;
  
        if (data[key] && item) {
            const index = data[key].indexOf(item);
            if (index > -1) {
                data[key].splice(index, 1);
                writeFile('blocker.json', data, () => {
                    res.status(200).send(`Item removed from ${key}`);
                });
            } else {
                res.status(404).send("Item not found");
            }
        } else {
            res.status(400).send("Invalid request");
        }
    });
});

module.exports.handler = serverless(app);