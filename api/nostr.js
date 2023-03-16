const NostrAPI = require('nostr-api');
const api = new NostrAPI('<YOUR_API_KEY>');

api.getFeed().then((feed) => {
  console.log(feed);
}).catch((err) => {
  console.error(err);
});
