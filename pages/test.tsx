import React, { useEffect, useState } from 'react';

const InstagramFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('Durai Samy'); // CHANGE THIS

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching posts for:', username);

        // Method 1: Instagram's public API
        const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
          headers: {
            'X-IG-App-ID': '936619743392459',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('API Data received:', data);

          if (data.data && data.data.user) {
            const userPosts = data.data.user.edge_owner_to_timeline_media.edges;
            
            const formattedPosts = userPosts.map(post => ({
              id: post.node.id,
              image: post.node.display_url,
              caption: post.node.edge_media_to_caption.edges[0]?.node.text || '',
              link: `https://www.instagram.com/p/${post.node.shortcode}/`,
              likes: post.node.edge_liked_by?.count || 0,
              comments: post.node.edge_media_to_comment?.count || 0,
              timestamp: post.node.taken_at_timestamp,
              isVideo: post.node.is_video
            }));

            setPosts(formattedPosts);
            console.log('Posts formatted:', formattedPosts.length);
          } else {
            throw new Error('User data not found in response');
          }
        } else {
          // If method 1 fails, try method 2
          await fetchInstagramFallback();
        }

      } catch (error) {
        console.error('Method 1 failed:', error);
        // Try fallback method
        await fetchInstagramFallback();
      } finally {
        setLoading(false);
      }
    };

    const fetchInstagramFallback = async () => {
      try {
        console.log('Trying fallback method...');
        const response = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=1`);
        
        if (response.ok) {
          const text = await response.text();
          console.log('Fallback response received');

          if (text.includes('graphql')) {
            const data = JSON.parse(text);
            const user = data.graphql.user;
            const userPosts = user.edge_owner_to_timeline_media.edges;

            const formattedPosts = userPosts.map(post => ({
              id: post.node.id,
              image: post.node.display_url,
              caption: post.node.edge_media_to_caption.edges[0]?.node.text || '',
              link: `https://www.instagram.com/p/${post.node.shortcode}/`,
              likes: post.node.edge_liked_by?.count || 0,
              comments: post.node.edge_media_to_comment?.count || 0,
              timestamp: post.node.taken_at_timestamp,
              isVideo: post.node.is_video
            }));

            setPosts(formattedPosts);
            console.log('Fallback posts loaded:', formattedPosts.length);
          } else {
            throw new Error('Invalid response format');
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setError(`Failed to load posts. Make sure the username "${username}" is correct and the account is public.`);
      }
    };

    if (username && username !== 'your_instagram_username') {
      fetchInstagramPosts();
    } else {
      setError('Please enter your Instagram username above');
      setLoading(false);
    }
  }, [username]);

  // Handle username input
  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    const newUsername = e.target.username.value.trim();
    if (newUsername) {
      setUsername(newUsername);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Instagram posts for @{username}...</p>
      </div>
    );
  }

  return (
    <div className="instagram-feed">
      <div className="feed-header">
        <h2>📸 Instagram Posts</h2>
        <form onSubmit={handleUsernameSubmit} className="username-form">
          <input
            type="text"
            name="username"
            placeholder="Enter Instagram username"
            defaultValue={username}
          />
          <button type="submit">Load Posts</button>
        </form>
      </div>

      {error && (
        <div className="error">
          <h3>❌ Unable to Load Posts</h3>
          <p>{error}</p>
          <div className="tips">
            <p><strong>Tips:</strong></p>
            <ul>
              <li>Make sure the username is correct</li>
              <li>Account must be public (not private)</li>
              <li>Account should have posts</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
        </div>
      )}

      {!error && posts.length > 0 && (
        <>
          <p className="posts-count">Showing {posts.length} posts from @{username}</p>
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <a 
                  href={post.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="post-link"
                >
                  <img 
                    src={post.image} 
                    alt={post.caption || 'Instagram post'} 
                    className="post-image"
                  />
                  {post.isVideo && <div className="video-indicator">▶️</div>}
                </a>
                
                <div className="post-content">
                  {post.caption && (
                    <p className="caption">
                      {post.caption.length > 120 
                        ? `${post.caption.substring(0, 120)}...` 
                        : post.caption
                      }
                    </p>
                  )}
                  
                  <div className="post-stats">
                    <span className="likes">❤️ {post.likes}</span>
                    <span className="comments">💬 {post.comments}</span>
                    <span className="timestamp">
                      {new Date(post.timestamp * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!error && posts.length === 0 && !loading && (
        <div className="no-posts">
          <p>No posts found for @{username}</p>
          <p>The account might be private or have no posts.</p>
        </div>
      )}
    </div>
  );
};

export default InstagramFeed;