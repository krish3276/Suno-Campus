import React, { useState } from 'react';

const PostCard = ({ post, onLike, onComment, onReport }) => {
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      await onLike(post._id, !isLiked);
    } catch (error) {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.author?.name}`,
        text: post.content,
        url: window.location.href,
      }).catch(() => {});
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-4 hover:shadow-md transition-shadow border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {post.author?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">{post.author?.name || 'Anonymous'}</h3>
              {post.author?.verified && (
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                  VERIFIED
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{post.author?.college || 'Unknown College'} • {formatTimestamp(post.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img 
            src={post.image} 
            alt="Post content" 
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        {/* Like Button */}
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            isLiked 
              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="text-base">👍</span>
          <span className="text-sm font-medium">Like ({likeCount})</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => onComment(post)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <span className="text-base">💬</span>
          <span className="text-sm font-medium">Comment ({post.comments || 0})</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <span className="text-base">🔗</span>
          <span className="text-sm font-medium">Share</span>
        </button>

        {/* Report Button */}
        {onReport && (
          <button
            onClick={() => onReport(post._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors ml-auto"
          >
            <span className="text-base">⚠️</span>
            <span className="text-sm font-medium">Report</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
