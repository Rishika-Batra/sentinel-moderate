import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testUpload() {
  try {
    const form = new FormData();
    form.append('text', 'Hello from test script! This is a sample post.');
    
    // Create a dummy image file for testing
    const dummyImagePath = path.join(__dirname, 'dummy.txt');
    fs.writeFileSync(dummyImagePath, 'this is not a real image but it tests the upload');
    
    form.append('image', fs.createReadStream(dummyImagePath));

    console.log('Sending request to http://localhost:5000/api/posts...');
    
    const response = await axios.post('http://localhost:5000/api/posts', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('Success! Post created:');
    console.log(JSON.stringify(response.data, null, 2));

    // Cleanup
    fs.unlinkSync(dummyImagePath);
    
  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  }
}

testUpload();
