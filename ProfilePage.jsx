import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProfileTabs from "../components/ProfileTabs";

const ProfilePage = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/${userId}`);
        setUserData(res.data.user);
        setIsFollowing(res.data.isFollowing);
        setIsCurrentUser(res.data.isCurrentUser);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleFollowToggle = async () => {
    try {
      const endpoint = isFollowing ? "unfollow" : "follow";
      await axios.post(`/api/users/${userId}/${endpoint}`);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Follow toggle error", error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!userData) return <div className="text-center text-red-500">User not found.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-6">
          <img
            src={userData.profilePicture || "/default-avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full border"
          />
          <div>
            <h1 className="text-2xl font-semibold">{userData.name}</h1>
            <p className="text-gray-500 text-sm">@{userData.username}</p>
            {userData.bio && <p className="mt-1 text-gray-600">{userData.bio}</p>}
          </div>
          <div className="ml-auto">
            {isCurrentUser ? (
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => alert("Show Edit Modal")}>Edit Profile</button>
            ) : (
              <button className={`px-4 py-2 rounded ${isFollowing ? "bg-gray-200 text-gray-700" : "bg-blue-600 text-white"}`} onClick={handleFollowToggle}>
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Tabs: Questions / Answers */}
      <ProfileTabs userId={userId} />
    </div>
  );
};

export default ProfilePage; 