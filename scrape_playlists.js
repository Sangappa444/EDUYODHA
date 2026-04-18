const ytpl = require('ytpl');
const fs = require('fs');

const playlists = [
  { id: 'PLBylmHF1VHV03x8N2nNjQWd9fIIvy3mmQ', name: 'KCET' },
  { id: 'PLBylmHF1VHV2uFWup3eJBC3pAu7eBuf0f', name: 'ML Numericals' },
  { id: 'PLBylmHF1VHV3nd2wcSt2l5VmJ5ULq7qM6', name: 'Cloud Computing Lab' },
  { id: 'PLBylmHF1VHV1OOCXC6TylDPeWhugKbcac', name: 'Artificial Intelligence' },
  { id: 'PLBylmHF1VHV3vULNlsYGnvMFnQ3TNMi04', name: 'Research Methodology' }
];

async function scrape() {
  let allVideos = [];
  
  for (const pl of playlists) {
    try {
      const result = await ytpl(pl.id, { limit: Infinity });
      for (const item of result.items) {
        allVideos.push([
            item.title.replace(/"/g, ''),
            item.id,
            pl.name,
            `From ${pl.name} playlist.`
        ]);
      }
      console.log(`Fetched ${result.items.length} videos from ${pl.name}`);
    } catch (e) {
      console.error(`Error with ${pl.name}:`, e.message);
    }
  }

  fs.writeFileSync('playlist_output.json', JSON.stringify(allVideos, null, 2));
  console.log("Written to playlist_output.json");
}

scrape();
