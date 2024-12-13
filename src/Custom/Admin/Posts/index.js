import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, CircularProgress } from '@mui/material';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// eslint-disable-next-line react/prop-types
const PostModal = ({ open, onClose, clubId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clubId && open) {
      fetchPosts(clubId);
    }
  }, [clubId, open]);

  const fetchPosts = async (clubId) => {
    setLoading(true);
    try {
      const db = getFirestore();
      const postsRef = collection(db, 'Clubs', clubId, 'Posts');
      const querySnapshot = await getDocs(postsRef);

      const postList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postList);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxHeight: "80%",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
          overflowY: "scroll",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}>
          Posts
        </Typography>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <Box
              key={post.id}
              sx={{
                mb: 3,
                border: "1px solid #ddd",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 2,
                backgroundColor: "#fff",
              }}
            >
              {post.imageUrl && (
                <Box
                  sx={{
                    height: 200,
                    width: "100%",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f8f8f8",
                  }}
                >
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    style={{
                      width: "50%", // Full width of the container
                      height: "auto", // Maintain aspect ratio
                      aspectRatio: "4 / 5", // Enforce Instagram-like portrait ratio
                      objectFit: "cover", // Ensure the image fills the container
                      borderRadius: "10px", // Optional: Add rounded corners for a modern look
                      backgroundColor: "#f0f0f0", // Optional: Add a background color as a placeholder
                    }}
                  />
                </Box>
              )}
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    mb: 1,
                  }}
                >
                  {post.description}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "gray",
                    fontSize: "0.85rem",
                  }}
                >
                  Posted: {new Date(post.timestamp.seconds * 1000).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Typography variant="body2" sx={{ textAlign: "center", color: "gray", mt: 5 }}>
            No posts available.
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default PostModal;
