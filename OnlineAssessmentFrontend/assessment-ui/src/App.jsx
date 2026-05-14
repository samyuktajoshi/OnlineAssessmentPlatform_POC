import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminAnalytics from "./pages/AdminAnalytics";
import ManageQuestions from "./pages/ManageQuestions";
import CreateAssessment from "./pages/CreateAssessment";
import AddQuestions from "./pages/AddQuestions";
import TakeTest from "./pages/TakeTest";
import Login from "./pages/Login";
import Assessments from "./pages/Assessments";
import Home from "./pages/Home";
import Result from "./pages/Result";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import { theme } from "./styles/theme";
import AdminDashboard from "./pages/AdminDashboard";
import ViewSubmissions from "./pages/ViewSubmissions";
import ManageAssessments from "./pages/ManageAssessments";
import MyResults from "./pages/MyResults";
import CandidateHome from "./pages/CandidateHome";

function App() {
  return (
    <div
      style={{
        backgroundColor: theme.colors.background,
        minHeight: "100vh",
      }}
    >
      <Router>
        {/* ✅ Toast Global */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="light"
        />

        <Routes>

          {/* 🔓 PUBLIC ROUTES */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔐 ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="Admin">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-assessments"
            element={
              <ProtectedRoute role="Admin">
                <Layout>
                  <ManageAssessments />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute role="Admin">
                <Layout>
                  <CreateAssessment />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-questions/:id"
            element={
              <ProtectedRoute role="Admin">
                <Layout>
                  <AddQuestions />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-questions/:id"
            element={
              <ProtectedRoute role="Admin">
                <Layout>
                  <ManageQuestions />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/view-submissions"
            element={
              <ProtectedRoute role="Admin">
                <Layout>
                  <ViewSubmissions />
                </Layout>
              </ProtectedRoute>
            }
          />
           <Route
  path="/admin-analytics/:id"
  element={
    <ProtectedRoute role="Admin">
      <Layout>
        <AdminAnalytics />
      </Layout>
    </ProtectedRoute>
  }
/>

          {/* 🔐 CANDIDATE ROUTES */}
          <Route
            path="/candidate-home"
            element={
              <ProtectedRoute role="Candidate">
                <Layout>
                  <CandidateHome />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessments"
            element={
              <ProtectedRoute role="Candidate">
                <Layout>
                  <Assessments />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/test/:id"
            element={
              <ProtectedRoute role="Candidate">
                <Layout>
                  <TakeTest />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/result"
            element={
              <ProtectedRoute role="Candidate">
                <Layout>
                  <Result />
                </Layout>
              </ProtectedRoute>
            }
          />
           
 
          <Route
            path="/my-results"
            element={
              <ProtectedRoute role="Candidate">
                <Layout>
                  <MyResults />
                </Layout>
              </ProtectedRoute>
            }
          />
          

        </Routes>
      </Router>
    </div>
  );
}

export default App;