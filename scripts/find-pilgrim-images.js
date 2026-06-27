import https from 'https';

const url = 'https://mosc.in/pilgrimcentres/';

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Find all image URLs
    const imageRegex = /wp-content\/uploads\/[^'\"\s<>]+\.(jpg|jpeg|png|gif)/gi;
    const matches = data.match(imageRegex);
    
    if (matches) {
      const unique = [...new Set(matches)];
      console.log('Found image URLs:');
      unique.forEach(u => {
        console.log(`https://mosc.in/${u}`);
      });
      
      // Try to match with pilgrim centre names
      const centres = [
        'puthuppally', 'koonan', 'seminary', 'cheriapally', 
        'kallooppara', 'chandanapally'
      ];
      
      console.log('\nMatching images for missing centres:');
      centres.forEach(centre => {
        const matches = unique.filter(u => 
          u.toLowerCase().includes(centre.toLowerCase())
        );
        if (matches.length > 0) {
          console.log(`${centre}: ${matches.map(m => `https://mosc.in/${m}`).join(', ')}`);
        }
      });
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});

