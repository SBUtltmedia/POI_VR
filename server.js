const express = require('express');
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 3000;
const app = express();

// default options
app.use(fileUpload());
app.use(express.static('dist'))

app.post('/upload', function (req, res) {
  let sampleFile;
  let uploadPath;
  console.log("Req files", req)
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.sampleFile;

  if (!sampleFile.name.endsWith('.glb')) {
    return res.status(400).send('Only .glb files are allowed.');
  }

  uploadPath = __dirname + '/public/models/' + sampleFile.name;

  sampleFile.mv(uploadPath, function (err) {
    if (err)
      return res.status(500).send(err);

    res.redirect(`/index.html?file=${sampleFile.name}`)
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});