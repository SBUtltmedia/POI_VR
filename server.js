const express = require('express');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const session = require('express-session');
const path = require('path');

const port = process.env.PORT || 3000;
const app = express();

const samlConfig = {
  entryPoint: 'https://mock-idp.com/saml/login', // Replace with your IdP URL
  issuer: 'glb-uploader-app', // Your app's identifier
  callbackUrl: 'http://localhost:3000/login/callback',
  cert: 'MOCK_CERTIFICATE' // Replace with your IdP's certificate
};

// Configure SAML strategy
passport.use(new SamlStrategy(samlConfig,
  (profile, done) => {
    // Mock user authentication
    return done(null, {
      id: profile.nameID,
      email: profile.email || 'user@example.com',
      displayName: profile.displayName || 'Mock User'
    });
  }
));

// Session configuration
app.use(session({
  secret: 'amirhamza',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serialization/deserialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ================== Middleware ==================
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

// SAML Auth routes
app.get('/login',
  passport.authenticate('saml', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);

app.post('/login/callback',
  express.urlencoded({ extended: false }),
  passport.authenticate('saml', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);

app.post('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Auth check endpoint
app.get('/api/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      authenticated: true,
      user: req.user
    });
  }
  res.json({ authenticated: false });
});

// File upload endpoint with auth check
app.post('/upload', async (req, res) => {
  try {
    // Check authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const sampleFile = req.files.sampleFile;

    // Validate file type
    if (!sampleFile.name.endsWith('.glb')) {
      return res.status(400).json({ error: 'Only .glb files are allowed.' });
    }

    // Define upload path
    const uploadPath = path.join(__dirname, 'public', 'models', sampleFile.name);

    // Move file to upload directory
    sampleFile.mv(uploadPath, (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(500).json({ error: 'File upload failed' });
      }

      res.json({
        success: true,
        file: sampleFile.name,
        path: `/models/${sampleFile.name}`
      });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});