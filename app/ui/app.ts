import React, { useState } from 'react';

// Header component
const Header = () => {
  return (
    <header>
      <h1>Pill Satoshi</h1>
      {/* Add navigation, search bar, etc. */}
    </header>
  );
};

// Tweet component
const Tweet = ({ author, content }) => {
  return (
    <div className="tweet">
      <span className="author">{author}</span>
      <p className="content">{content}</p>
    </div>
  );
};

// Main component
const App = () => {
  // Sample data for tweets
  const [tweets, setTweets] = useState([
    { author: 'JohnDoe', content: 'Hello, Twitter!' },
    { author: 'JaneSmith', content: 'Tweeting is fun!' },
    // Add more tweets here
  ]);

  return (
    <div className="app">
      <Header />

      <div className="tweets-container">
        {tweets.map((tweet, index) => (
          <Tweet key={index} author={tweet.author} content={tweet.content} />
        ))}
      </div>

      {/* Add a form for posting new tweets */}
    </div>
  );
};

export default App;
