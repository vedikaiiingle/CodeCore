import React, { useState, useEffect } from "react";
import QuestionCard from "./QuestionCard";
import AnswerCard from "./AnswerCard";
import { useNavigate } from "react-router-dom";

const ProfileTabs = ({ userId, isCurrentUser }) => {
  const [activeTab, setActiveTab] = useState("questions");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "questions") {
          const res = await fetch(`/api/users/${userId}/questions`);
          const data = await res.json();
          setQuestions(data);
        } else {
          const res = await fetch(`/api/users/${userId}/answers`);
          const data = await res.json();
          setAnswers(data);
        }
      } catch (err) {
        console.error("Error loading tab data:", err);
      }
    };
    fetchData();
  }, [activeTab, userId]);

  return (
    <div className="mt-6">
      <div className="flex border-b border-gray-200 items-center">
        <button
          className={`mr-4 pb-2 border-b-2 ${
            activeTab === "questions" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-600"
          }`}
          onClick={() => setActiveTab("questions")}
        >
          Questions
        </button>
        <button
          className={`pb-2 border-b-2 ${
            activeTab === "answers" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-600"
          }`}
          onClick={() => setActiveTab("answers")}
        >
          Answers
        </button>
        {/* Add Question button for own profile on Questions tab */}
        {isCurrentUser && activeTab === "questions" && (
          <button
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => navigate('/ask')}
          >
            + Add Question
          </button>
        )}
      </div>
      <div className="mt-4">
        {activeTab === "questions"
          ? questions.map((q) => <QuestionCard key={q._id} question={q} />)
          : answers.map((a) => <AnswerCard key={a._id} answer={a} />)}
      </div>
    </div>
  );
};

export default ProfileTabs; 