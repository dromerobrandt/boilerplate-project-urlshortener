require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://dgromerobrandt:isYbZRCJeR5PECel@urls.375pr6e.mongodb.net/url-shortener-microservice?retryWrites=true&w=majority&appName=URLs', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.once('open', () => console.log('Connected to MongoDB'));

const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: String,
    required: true
  }
});

const URL = mongoose.model('URL', urlSchema);

// const createAndSaveUrl = (done) => {
//   let person = new URL({
//     original_url: 
//   });

//   person.save(function(err, data) {
//     if (err) return done(err);
//     done(null, data);
//   })
// };

// exports.createAndSaveUrl = createAndSaveUrl;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  const original_url = req.body.url;
  
  if (!validUrl.isWebUri(original_url)) {
    return res.json({
      'error': 'invalid url'
    });
  }
  console.log('valid url');
  const url_obj = new URL(req.body);
  dns.lookup(url_obj.hostname, async (err) => {
    if (err) {
      return res.json({
        'error': 'invalid url'
      });
    }

    try {
      let url = await URL.findOne({
        'original_url': original_url
      });
      if (url) {
        return res.json({
          'original_url': url.original_url,
          'short_url': url.short_url
        });
      }
      const short_url = Math.floor(Math.random() * 10000).toString();
      
      url = new URL({
        original_url: original_url,
        short_url: short_url
      });

      await url.save();

      return res.json({
        'original_url': url.original_url,
        'short_url': url.short_url
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        'error': 'server error'
      });
    }
  })
});

app.get('/api/shorturl/:short_url', (req, res) => {
  console.log(req.params)
  const {shortUrl} = req.params.short_url;
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
